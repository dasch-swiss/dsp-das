import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { map, startWith } from 'rxjs';
import { QueryObject, IriLabelPair } from './model';
import { provideAdvancedSearch } from './providers';
import { AdvancedSearchDataService } from './service/advanced-search-data.service';
import { GravsearchService } from './service/gravsearch.service';
import { PreviousSearchService } from './service/previous-search.service';
import { PropertyFormManager } from './service/property-form.manager';
import { SearchStateService } from './service/search-state.service';
import { AdvancedSearchFooterComponent } from './ui/advanced-search-footer.component';
import { AdvancedSearchHeaderComponent } from './ui/advanced-search-header.component';
import { OntologyFormComponent } from './ui/ontology-form.component';
import { ResourceValueComponent } from './ui/statement-builder/object-values/resource-value/resource-value.component';
import { StatementBuilderComponent } from './ui/statement-builder/statement-builder.component';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    AdvancedSearchHeaderComponent,
    AdvancedSearchFooterComponent,
    OntologyFormComponent,
    StatementBuilderComponent,
    MatProgressBar,
    ResourceValueComponent,
  ],
  template: `
    <div class="width-90-percent max-width-100em">
      <app-advanced-search-header class="flex-space-between margin-bottom-1em" />
      <app-ontology-form />
      <app-resource-value
        [availableResources]="resourceClasses$ | async"
        (selectedResourceChange)="formManager.updateSelectedResourceClass($event)" />
      @if ((ontologyLoading$ | async) === true) {
        <mat-progress-bar mode="query" />
      }
      @if ((ontologyLoading$ | async) === false) {
        <app-statement-builder [statementElements]="searchState.statementElements$ | async" />
        <app-advanced-search-footer
          class="flex-space-between margin-top-1em"
          (searchTriggered)="doSearch()"
          (resetTriggered)="resetSearch()" />
      }
    </div>
  `,
  styleUrls: ['./advanced-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideAdvancedSearch()],
})
export class AdvancedSearchComponent implements OnInit {
  @Input({ required: true }) projectUuid!: string;
  @Output() gravesearchQuery = new EventEmitter<QueryObject>();

  private readonly SEARCH_ALL_RESOURCE_CLASSES_OPTION: IriLabelPair = {
    iri: 'all-resource-classes',
    label: 'All resource classes',
  } as const;

  searchState: SearchStateService = inject(SearchStateService);
  formManager: PropertyFormManager = inject(PropertyFormManager);

  private _dataService: AdvancedSearchDataService = inject(AdvancedSearchDataService);
  private _gravsearchService: GravsearchService = inject(GravsearchService);
  private _previousSearchService: PreviousSearchService = inject(PreviousSearchService);

  ontologyLoading$ = this._dataService.ontologyLoading$;

  resourceClasses$ = this._dataService.resourceClasses$.pipe(
    map(classes => [this.SEARCH_ALL_RESOURCE_CLASSES_OPTION, ...classes]),
    startWith([this.SEARCH_ALL_RESOURCE_CLASSES_OPTION])
  );

  get projectIri() {
    return `http://rdfh.ch/projects/${this.projectUuid}`;
  }

  ngOnInit(): void {
    this._previousSearchService.init(this.projectIri);
    this._dataService.init(this.projectIri);
  }

  doSearch(): void {
    const state = this.searchState.currentState;
    this._previousSearchService.storeSearchSnapshot(
      this.projectIri,
      this._dataService.selectedOntology,
      this.searchState.currentState
    );

    const query = this._gravsearchService.generateGravSearchQuery(
      state.selectedResourceClass?.iri,
      this.searchState.nonEmptyStatementElements,
      state.propertiesOrderBy
    );

    const queryObject: QueryObject = {
      query,
      properties: this.searchState.nonEmptyStatementElements,
    };
    this.gravesearchQuery.emit(queryObject);
  }

  resetSearch(): void {
    this._dataService.init(this.projectIri);
    this.searchState.clearAllSelections();
  }
}
