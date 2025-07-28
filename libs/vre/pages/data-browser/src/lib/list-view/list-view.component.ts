import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  ApiResponseError,
  CountQueryResponse,
  KnoraApiConnection,
  ReadResource,
  ReadResourceSequence,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { OntologiesSelectors } from '@dasch-swiss/vre/core/state';
import { FilteredResources, SearchParams } from '@dasch-swiss/vre/shared/app-common-to-move';
import { ComponentCommunicationEventService, EmitEvent, Events } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { combineLatest, finalize, map, of, switchMap, take, tap } from 'rxjs';

export interface ShortResInfo {
  id: string;
  label: string;
}

export interface CheckboxUpdate {
  checked: boolean;
  resIndex: number;
  resId: string;
  resLabel: string;
  isCheckbox: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-list-view',
  template: `
    <app-pager
      *ngIf="numberOfAllResults"
      (pageIndexChanged)="doSearch($event)"
      [numberOfAllResults]="numberOfAllResults" />
    <div class="loader-container">
      <mat-progress-bar mode="indeterminate" *ngIf="loading" />
    </div>

    <app-resource-list
      [withMultipleSelection]="true"
      [resources]="resources"
      [selectedResourceIdx]="selectedResourceIdx"
      (resourcesSelected)="emitSelectedResources($event)" />
  `,
  styleUrls: ['./list-view.component.scss'],
})
export class ListViewComponent implements OnChanges, OnInit, OnDestroy {
  @Input() search: SearchParams | undefined = undefined;
  @Input() withMultipleSelection = false;
  @Output() selectedResources = new EventEmitter<FilteredResources>();

  currentSearch: SearchParams | undefined = undefined;
  resources: ReadResource[] = [];
  selectedResourceIdx: number[] = [];
  numberOfAllResults = 0;
  loading = true;

  translation$ = this._translateService.onLangChange.pipe(
    switchMap(() => this._store.select(OntologiesSelectors.projectOntology)),
    map(currentOntology => {
      if (currentOntology !== undefined && !!currentOntology.id) {
        this._dspApiConnection.v2.ontologyCache.reloadCachedItem(currentOntology!.id).pipe(take(1));
      }
    })
  );

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _componentCommsService: ComponentCommunicationEventService,
    private _notification: NotificationService,
    private _cd: ChangeDetectorRef,
    private _store: Store,
    private _translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.translation$.subscribe(() => this.doSearch());

    const currentOntologyClass = this._store.selectSnapshot(OntologiesSelectors.currentOntologyClass);
    if (currentOntologyClass) {
      const currentOntology = this._store.selectSnapshot(OntologiesSelectors.projectOntology);
      this._dspApiConnection.v2.ontologyCache.reloadCachedItem(currentOntology.id).subscribe(() => {
        this._initSearch();
      });
    }
  }

  ngOnChanges(): void {
    if (this.isCurrentSearch()) {
      this.currentSearch = this.search;
      this._initSearch();
    }
  }

  isCurrentSearch = (): boolean =>
    this.search?.query !== this.currentSearch?.query || this.currentSearch?.query === undefined;

  private _initSearch(): void {
    this.loading = true;
    this.resources = [];
    this._cd.detectChanges();
    this.emitSelectedResources();
    this.doSearch();
  }

  emitSelectedResources(res?: FilteredResources) {
    if (!res || res.count === 0) {
      // no resource is selected: In case of an error or no search results
      this.selectedResources.emit({
        count: 0,
        resListIndex: [],
        resInfo: [],
        selectionType: 'single',
      });
    } else if (res.count > 0) {
      this.selectedResourceIdx = res.resListIndex;
      this.selectedResources.emit(res);
    }
  }

  doSearch(index = 0) {
    this.loading = true;

    if (this.search?.mode === 'fulltext') {
      if (index === 0 && !this.isCurrentSearch()) {
        this._performCountQuery(index);
      }

      this._performFulltextSearch(index);
    } else if (this.search?.mode === 'gravsearch') {
      this._performGravSearch(index);
    }
  }

  private _performGravSearch(index: number) {
    this._componentCommsService.emit(new EmitEvent(Events.gravSearchExecuted, true));

    if (this.search?.query === undefined) {
      this._notification.openSnackBar('The gravsearch query is not set correctly');
      this.resources = [];
      this.loading = false;
      this._cd.markForCheck();
      return;
    }

    const numberOfAllResults$ =
      index !== 0
        ? of(this.numberOfAllResults)
        : this._dspApiConnection.v2.search.doExtendedSearchCountQuery(this.search.query).pipe(
            map(count => {
              this.numberOfAllResults = count.numberOfResults;
              if (this.numberOfAllResults === 0) {
                this._notification.openSnackBar('No resources to display.');
                this.emitSelectedResources();
                this.resources = [];
                this.loading = false;
                this._cd.markForCheck();
              }

              return count.numberOfResults;
            })
          );

    let gravsearch = this.search.query;
    gravsearch = gravsearch.substring(0, gravsearch.search('OFFSET'));
    gravsearch = `${gravsearch}OFFSET ${index}`;

    const graveSearchQuery$ = this._dspApiConnection.v2.search.doExtendedSearch(gravsearch);
    combineLatest([graveSearchQuery$, numberOfAllResults$])
      .pipe(
        tap({
          error: () => {
            this.loading = false;
            this.resources = [];
          },
        })
      )
      .subscribe(([response, numberOfAllResults]) => {
        response = response as ReadResourceSequence;
        if (this.numberOfAllResults === 0) {
          this.numberOfAllResults = response.resources.length;
        }

        if (response.resources.length === 0 && this.numberOfAllResults > 0) {
          this._notification.openSnackBar('No permission to display the resources.');
          this.emitSelectedResources();
        }

        this.resources = response.resources;

        this.loading = false;
        this._cd.markForCheck();
      });
  }

  private _performCountQuery(index: number) {
    // perform count query
    this._dspApiConnection.v2.search.doFulltextSearchCountQuery(this.search.query, index, this.search.filter).subscribe(
      (count: CountQueryResponse) => {
        this.numberOfAllResults = count.numberOfResults;
        if (this.numberOfAllResults === 0) {
          this.emitSelectedResources();
          this.resources = [];
          this.loading = false;
          this._cd.markForCheck();
        }
      },
      error => {
        if (error instanceof ApiResponseError && error.status === 400) {
          this.numberOfAllResults = 0;
        }
        this.loading = false;
        this._cd.markForCheck();
      }
    );
  }

  private _performFulltextSearch(index: number) {
    this._dspApiConnection.v2.search
      .doFulltextSearch(this.search.query, index, this.search.filter)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        response => {
          // if the response does not contain any resources even though the search count is greater than 0,
          // it means that the user does not have the permissions to see anything: emit an empty result
          if (response.resources.length === 0) {
            this.emitSelectedResources();
          }
          this.resources = response.resources;
          this._cd.markForCheck();
        },
        () => {
          this.resources = [];
        }
      );
  }
}
