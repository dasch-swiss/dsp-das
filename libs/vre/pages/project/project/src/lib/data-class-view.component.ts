import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  MultipleViewerComponent,
  MultipleViewerService,
  ResourceListSelectionComponent,
} from '@dasch-swiss/vre/pages/data-browser';
import { provideSearchFilters, StatementDraftStore } from '@dasch-swiss/vre/pages/search/search-filters';
import { OntologyService, ResourceResultService } from '@dasch-swiss/vre/shared/app-helper-services';
import { AppProgressIndicatorComponent } from '@dasch-swiss/vre/ui/progress-indicator';
import { CenteredBoxComponent, NoResultsFoundComponent } from '@dasch-swiss/vre/ui/ui';
import { TranslatePipe } from '@ngx-translate/core';
import { AngularSplitModule, SplitGutterInteractionEvent } from 'angular-split';
import { combineLatest, distinctUntilChanged, EMPTY, first, map, skip } from 'rxjs';
import { DataClassHeaderComponent } from './data-class-header.component';
import { DataClassPanelComponent } from './data-class-panel.component';
import { provideDataClassSearch } from './data-class-query.service';
import { DataClassUrlStateService, DataClassView } from './data-class-url-state.service';
import { ProjectPageService } from './project-page.service';

/**
 * The result list's default width from each breakpoint up, widest first.
 * The min-widths are the md–xxl tokens of `apps/dsp-app/src/styles/_responsive.scss` (DEV-7557).
 */
export const RESULT_LIST_WIDTHS: readonly (readonly [minWidth: number, width: number])[] = [
  [2560, 440],
  [1920, 400],
  [1536, 380],
  [1280, 360],
];

/** Below the md breakpoint (1280). */
export const RESULT_LIST_WIDTH_BELOW_MD = 300;

const QUERIES = RESULT_LIST_WIDTHS.map(([minWidth]) => `(min-width: ${minWidth}px)`);

@Component({
  selector: 'app-data-class-view',
  template: `
    @if (data$ | async; as classSelected) {
      @if (dataIsNotFound) {
        <app-centered-box>
          <app-no-results-found [message]="'pages.dataBrowser.dataClassView.noData' | translate" />
        </app-centered-box>
      } @else {
        <app-data-class-header [classSelected]="classSelected" />
        <!-- Under the header and above the split, so it is the same banner in both views.
             Inside the viewer it was invisible in table view, which has no viewer — and it was
             describing the selection, not the panel it happened to sit in.

             selectMode is read in the template rather than folded into a computed: it is a plain
             field on the service with no change notification, and a computed that reads it behind
             a short-circuited signal read registers no dependency and caches forever (DEV-7466).
             A template binding is re-evaluated every pass, so it cannot go stale. -->
        @if ((selectedResources$ | async)?.length && multipleViewerService.selectMode) {
          <app-resource-list-selection />
        }
        <!-- In list view the result list's width follows the screen's breakpoint until the user drags
             its gutter (DEV-7557); in table view it takes the whole width. -->
        <as-split direction="horizontal" unit="pixel" (dragEnd)="onResultListDragged($event)">
          <as-split-area [size]="panelSize()" cdkScrollable>
            <app-data-class-panel [classSelected]="classSelected" />
          </as-split-area>
          <!-- Hidden rather than sized to zero: a zero-width area still draws its gutter and still
               renders the viewer, which would keep fetching the selected resource for a panel
               nobody can see. -->
          <as-split-area [size]="viewerSize()" [visible]="viewerIsVisible()">
            <app-multiple-viewer (afterResourceDeleted)="onResourceDeleted()" />
          </as-split-area>
        </as-split>
      }
    } @else {
      <app-progress-indicator />
    }
  `,
  styles: [
    `
      /* A column, so the split gets the height left under the header rather than the whole page
         area's. Sized to 100% it overflowed by exactly the header, and the page area scrolled that
         much on top of the list's or the table's own scroll. */
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
      }
      app-data-class-header,
      app-resource-list-selection {
        flex: none;
      }
      as-split {
        flex: 1 1 0;
        min-height: 0;
      }
      .viewer-area {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
      }
      .viewer-toolbar {
        display: flex;
        justify-content: flex-end;
        flex: none;
      }
      app-multiple-viewer {
        flex: 1;
        min-height: 0;
      }
    `,
  ],
  imports: [
    AsyncPipe,
    TranslatePipe,
    AngularSplitModule,
    CenteredBoxComponent,
    NoResultsFoundComponent,
    AppProgressIndicatorComponent,
    DataClassHeaderComponent,
    DataClassPanelComponent,
    MultipleViewerComponent,
    ResourceListSelectionComponent,
  ],
  // Scoped here rather than on the panel so the class header and the list resolve one query, and so
  // a class switch tears the whole search state down with the view. `ResourceResultService` joins
  // them for the same reason: the count and pager live in the header, and they have to read the same
  // instance the list writes.
  providers: [...provideSearchFilters(), ...provideDataClassSearch(), ResourceResultService],
})
export class DataClassViewComponent {
  /**
   * How the split is divided, and whether the right half exists at all.
   *
   * The table has no side viewer: a row opens in the app's drawer dialog, the same one a resource
   * opens in everywhere else. A panel beside the table would be a second rendering of the same
   * resource to keep in step, so table view is simply full width.
   *
   * Hidden rather than sized to zero — a zero-width area still draws its gutter and still renders
   * the viewer, which would keep fetching the selected resource for a panel nobody can see.
   */
  private readonly _view = toSignal(inject(DataClassUrlStateService).view$, { initialValue: 'list' as DataClassView });

  /** Public: the selection banner's visibility is decided in this component's template. */
  readonly multipleViewerService = inject(MultipleViewerService);
  readonly selectedResources$ = this.multipleViewerService.selectedResources$;

  private readonly _breakpoints = inject(BreakpointObserver);

  /** The width for the widest breakpoint the screen reaches. */
  private readonly _breakpointWidth = toSignal(
    this._breakpoints.observe(QUERIES).pipe(map(() => this._widthForScreen())),
    { initialValue: this._widthForScreen() }
  );

  /** The width the user dragged the result list to, if they have. */
  private readonly _draggedWidth = signal<number | undefined>(undefined);

  /**
   * The breakpoint's width until the user drags the result list; from then on, their width —
   * resizing the window no longer changes it.
   */
  readonly resultListWidth = computed(() => this._draggedWidth() ?? this._breakpointWidth());

  readonly viewerIsVisible = computed(() => this._view() !== 'table');

  /**
   * The split is in pixels: the list gets its width and the viewer the rest (`*`). In table view the
   * list is the rest, and the hidden viewer gets a number so the split never sees two `*`.
   */
  readonly panelSize = computed(() => (this.viewerIsVisible() ? this.resultListWidth() : ('*' as const)));
  readonly viewerSize = computed(() => (this.viewerIsVisible() ? ('*' as const) : 0));

  dataIsNotFound = false;
  data$ = combineLatest([
    this._route.params,
    this._projectPageService.currentProject$.pipe(first()),
    this._projectPageService.ontologies$,
  ]).pipe(
    map(([params, project, ontologies]) => {
      this.dataIsNotFound = false;
      const ontologyLabel = params[RouteConstants.ontologyParameter] as string;
      const classLabel = params[RouteConstants.classParameter] as string;

      const ontology = ontologies.find(
        ontology_ => ontology_.id === this._ontologyService.getOntologyIriFromRoute(project.shortcode, ontologyLabel)
      );

      if (!ontology) {
        this.dataIsNotFound = true;
        return EMPTY;
      }

      const classId = this._ontologyService.getClassIdFromParams(project.shortcode, ontologyLabel, classLabel);
      const resClass = Object.values(ontology.classes).find(cls => cls.id === classId);

      if (!resClass) {
        this.dataIsNotFound = true;
        return EMPTY;
      }

      return { ontologyLabel, classLabel, ontology, resClass: resClass as ResourceClassDefinitionWithAllLanguages };
    })
  );
  constructor(
    private readonly _projectPageService: ProjectPageService,
    private readonly _route: ActivatedRoute,
    private readonly _ontologyService: OntologyService,
    private readonly _urlState: DataClassUrlStateService,
    private readonly _draftStore: StatementDraftStore
  ) {
    this._clearSearchStateOnClassSwitch();
  }

  /**
   * A filter belongs to the class it was built against: its predicates come from that class, and
   * carrying `?filters=…` across a class switch would either silently match nothing or, worse, be
   * stripped field by field with no explanation.
   *
   * `skip(1)` is what makes a deep link work. The first emission is arrival, not a switch, and
   * resetting there would wipe the filters and sort out of the very URL the user was sent.
   */
  private _clearSearchStateOnClassSwitch(): void {
    this._route.params
      .pipe(
        map(params => params[RouteConstants.classParameter] as string),
        distinctUntilChanged(),
        skip(1),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this._urlState.reset();
        // Not part of the URL, so the reset navigation alone would leave a half-built filter from the
        // previous class sitting in the editor.
        this._draftStore.discardDrafts();
      });
  }

  onResourceDeleted() {
    this._projectPageService.reloadProject();
  }

  onResultListDragged({ sizes }: SplitGutterInteractionEvent): void {
    const [width] = sizes;
    if (typeof width === 'number') {
      this._draggedWidth.set(width);
    }
  }

  private _widthForScreen(): number {
    const match = RESULT_LIST_WIDTHS.find((_, index) => this._breakpoints.isMatched(QUERIES[index]));
    return match ? match[1] : RESULT_LIST_WIDTH_BELOW_MD;
  }
}
