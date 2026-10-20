import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { MultipleViewerComponent } from '@dasch-swiss/vre/pages/data-browser';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { AppProgressIndicatorComponent } from '@dasch-swiss/vre/ui/progress-indicator';
import { CenteredBoxComponent, NoResultsFoundComponent } from '@dasch-swiss/vre/ui/ui';
import { TranslatePipe } from '@ngx-translate/core';
import { AngularSplitModule, SplitGutterInteractionEvent } from 'angular-split';
import { combineLatest, EMPTY, first, map } from 'rxjs';
import { DataClassPanelComponent } from './data-class-panel.component';
import { ProjectPageService } from './project-page.service';

/**
 * The result list's default width from each breakpoint up, widest first: twice the class sidebar's.
 * The min-widths are the md–xxl tokens of `apps/dsp-app/src/styles/_responsive.scss` (DEV-7557).
 */
export const RESULT_LIST_WIDTHS: readonly (readonly [minWidth: number, width: number])[] = [
  [2560, 720],
  [1920, 640],
  [1536, 560],
  [1280, 440],
];

/** Below the md breakpoint (1280). */
export const RESULT_LIST_WIDTH_BELOW_MD = 340;

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
        <!-- The result list's width follows the screen's breakpoint until the user drags its gutter
             (DEV-7557). -->
        <as-split direction="horizontal" unit="pixel" (dragEnd)="onResultListDragged($event)">
          <as-split-area [size]="resultListWidth()" cdkScrollable>
            <app-data-class-panel [classSelected]="classSelected" />
          </as-split-area>
          <as-split-area size="*">
            <app-multiple-viewer (afterResourceDeleted)="onResourceDeleted()" />
          </as-split-area>
        </as-split>
      }
    } @else {
      <app-progress-indicator />
    }
  `,
  imports: [
    AsyncPipe,
    TranslatePipe,
    AngularSplitModule,
    CenteredBoxComponent,
    NoResultsFoundComponent,
    AppProgressIndicatorComponent,
    DataClassPanelComponent,
    MultipleViewerComponent,
  ],
})
export class DataClassViewComponent {
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
    private readonly _ontologyService: OntologyService
  ) {}

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
