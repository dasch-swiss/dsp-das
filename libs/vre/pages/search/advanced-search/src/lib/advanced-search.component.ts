import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { TranslateModule } from '@ngx-translate/core';
import { map, startWith } from 'rxjs';
import { INITIAL_FORMS_STATE, SEARCH_ALL_RESOURCE_CLASSES_OPTION } from './constants';
import { StatementElement, QueryObject, IriLabelPair } from './model';
import { provideAdvancedSearch } from './providers';
import { AdvancedSearchDataService } from './service/advanced-search-data.service';
import { GravsearchService } from './service/gravsearch.service';
import { PreviousSearchService } from './service/previous-search.service';
import { PropertyFormManager } from './service/property-form.manager';
import { SearchStateService } from './service/search-state.service';
import { OntologyFormComponent } from './ui/ontology-form.component';
import { OrderByComponent } from './ui/order-by/order-by.component';
import { PropertyFormResourceComponent } from './ui/statement-builder/property-form-resource/property-form-resource.component';
import { StatementBuilderComponent } from './ui/statement-builder/statement-builder.component';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    OrderByComponent,
    OntologyFormComponent,
    StatementBuilderComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    TranslateModule,
    MatProgressBar,
    PropertyFormResourceComponent,
  ],
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideAdvancedSearch()],
})
export class AdvancedSearchComponent implements OnInit {
  @Input({ required: true }) projectUuid!: string;
  @Output() gravesearchQuery = new EventEmitter<QueryObject>();

  searchState: SearchStateService = inject(SearchStateService);
  private _dataService: AdvancedSearchDataService = inject(AdvancedSearchDataService);
  private _dialogService: DialogService = inject(DialogService);
  private _gravsearchService: GravsearchService = inject(GravsearchService);
  private _formManager: PropertyFormManager = inject(PropertyFormManager);
  previousSearchService: PreviousSearchService = inject(PreviousSearchService);

  ontologyLoading$ = this._dataService.ontologyLoading$;
  ontologies$ = this._dataService.ontologies$;

  resourceClasses$ = this._dataService.resourceClasses$.pipe(
    map(classes => [SEARCH_ALL_RESOURCE_CLASSES_OPTION, ...classes]),
    startWith([SEARCH_ALL_RESOURCE_CLASSES_OPTION])
  );

  get projectIri() {
    return `http://rdfh.ch/projects/${this.projectUuid}`;
  }

  ngOnInit(): void {
    this.previousSearchService.init(this.projectIri);
    const previousOntology = this.previousSearchService.previousSearchObject.selectedOntology;
    const previousResourceClass = this.previousSearchService.previousSearchObject.selectedResourceClass;
    this._dataService.init(this.projectIri, previousOntology, previousResourceClass);
  }

  onSelectedResourceClassChanged(resourceClass: IriLabelPair = SEARCH_ALL_RESOURCE_CLASSES_OPTION): void {
    this._formManager.updateSelectedResourceClass(resourceClass);
  }

  removePropertyForm(statementElement: StatementElement): void {
    this._formManager.deleteStatement(statementElement);
  }

  doSearch(): void {
    const state = this.searchState.currentState;
    this.previousSearchService.storeSearchSnapshot(
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
    this._dialogService.afterConfirmation('Are you sure you want to reset the form?').subscribe(() => {
      this._dataService.init(this.projectIri);
      this.searchState.clearAllSelections();
    });
  }

  loadPreviousSearch(): void {
    const previousSearch = this.previousSearchService.previousSearchObject;
    this.searchState.patchState({
      ...INITIAL_FORMS_STATE,
      ...previousSearch,
    });
    this._dataService.setOntology(previousSearch.selectedOntology?.iri || '');
    if (previousSearch.selectedResourceClass) {
      this._dataService.setSelectedResourceClass(previousSearch.selectedResourceClass);
    }
  }
}
