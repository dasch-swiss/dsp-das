import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppProgressIndicatorComponent } from '@dasch-swiss/vre/ui/progress-indicator';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { TranslateModule } from '@ngx-translate/core';
import { PropertyFormItem, QueryObject } from './model';
import { AdvancedSearchDataService } from './service/advanced-search-data.service';
import { GravsearchService } from './service/gravsearch.service';
import { PreviousSearchService } from './service/previous-search.service';
import { PropertyFormManager } from './service/property-form.manager';
import { SearchStateService } from './service/search-state.service';
import { OntologyFormComponent } from './ui/ontology-form.component';
import { OrderByComponent } from './ui/order-by/order-by.component';
import { PropertyFormSubcriteriaComponent } from './ui/property-form/property-form-subcriteria/property-form-subcriteria.component';
import { PropertyFormComponent } from './ui/property-form/property-form.component';
import { ResourceClassFormComponent } from './ui/resource-class-form.component';
import { INITIAL_FORMS_STATE } from './util';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    OrderByComponent,
    OntologyFormComponent,
    ResourceClassFormComponent,
    PropertyFormComponent,
    PropertyFormSubcriteriaComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    TranslateModule,
    MatProgressBar,
  ],
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  get projectIri() {
    return `http://rdfh.ch/projects/${this.projectUuid}`;
  }

  ngOnInit(): void {
    this.previousSearchService.init(this.projectIri);
    const previousOntology = this.previousSearchService.previousSearchObject.selectedOntology;
    const previousResourceClass = this.previousSearchService.previousSearchObject.selectedResourceClass;
    this._dataService.init(this.projectIri, previousOntology, previousResourceClass);
  }

  removePropertyForm(property: PropertyFormItem): void {
    this._formManager.deletePropertyForm(property);
  }

  doSearch(): void {
    const state = this.searchState.currentState;
    this.previousSearchService.storeSearchSnapshot(this.projectIri, this._dataService.selectedOntology, state);

    const nonEmptyProperties = state.propertyFormList.filter(prop => prop.selectedProperty);

    const query = this._gravsearchService.generateGravSearchQuery(
      state.selectedResourceClass?.iri,
      nonEmptyProperties,
      state.propertiesOrderBy
    );

    const queryObject: QueryObject = {
      query,
      properties: nonEmptyProperties,
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
