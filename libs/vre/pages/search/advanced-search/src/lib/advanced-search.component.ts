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
import { AdvancedSearchOntologySelectComponent } from './ui/advanced-search-ontology-select.component';
import { ResourceValueComponent } from './ui/statement-builder/object-values/resource-value/resource-value.component';
import { StatementBuilderComponent } from './ui/statement-builder/statement-builder.component';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    AdvancedSearchHeaderComponent,
    AdvancedSearchFooterComponent,
    AdvancedSearchOntologySelectComponent,
    StatementBuilderComponent,
    MatProgressBar,
    ResourceValueComponent,
  ],
  template: `
    <div class="width-90-percent max-width-100em">
      <app-advanced-search-header class="flex-space-between margin-bottom-1em" />
      <app-advanced-search-ontology-form />
      <app-resource-value
        [selectedResource]="searchState.currentState.selectedResourceClass"
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

  searchState: SearchStateService = inject(SearchStateService);
  formManager: PropertyFormManager = inject(PropertyFormManager);

  private _dataService: AdvancedSearchDataService = inject(AdvancedSearchDataService);
  private _gravsearchService: GravsearchService = inject(GravsearchService);
  private _previousSearchService: PreviousSearchService = inject(PreviousSearchService);

  ontologyLoading$ = this._dataService.ontologyLoading$;

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
      this.searchState.validStatementElements,
      state.orderBy
    );

    const queryObject: QueryObject = {
      query,
      properties: this.searchState.validStatementElements,
    };
    this.gravesearchQuery.emit(queryObject);
  }

  resetSearch(): void {
    this._dataService.init(this.projectIri);
    this.searchState.clearAllSelections();
  }
}
