import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '@dasch-swiss/dsp-js';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';
import { AdvancedSearchStateSnapshot, PropertyFormItem, QueryObject } from './model';
import { PropertyFormManager } from './service/property-form.manager';
import { SearchStateService } from './service/search-state.service';
import { FormActionsComponent } from './ui/form-actions/form-actions.component';
import { OntologyResourceFormComponent } from './ui/ontology-resource-form/ontology-resource-form.component';
import { OrderByComponent } from './ui/order-by/order-by.component';
import { PropertyFormSubcriteriaComponent } from './ui/property-form/property-form-subcriteria/property-form-subcriteria.component';
import { PropertyFormComponent } from './ui/property-form/property-form.component';
import { EMPTY_PROPERTY_FORM_ITEM } from './util';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    OrderByComponent,
    OntologyResourceFormComponent,
    PropertyFormComponent,
    PropertyFormSubcriteriaComponent,
    FormActionsComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    TranslateModule,
  ],
  providers: [SearchStateService],
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSearchComponent implements OnInit {
  // either the uuid of the project or the shortcode
  // new projects use uuid, old projects use shortcode
  @Input() uuid: string | undefined = undefined;

  @Output() emitGravesearchQuery = new EventEmitter<QueryObject>();

  private _searchState: SearchStateService = inject(SearchStateService);
  route: ActivatedRoute = inject(ActivatedRoute);
  private _formManager = inject(PropertyFormManager);

  selectedProject$ = this._searchState.selectedProject$;
  propertyFormList$ = this._searchState.propertyForms$;

  constants = Constants;
  previousSearchObject: AdvancedSearchStateSnapshot | null = null;

  constructor(private _dialogService: DialogService) {}

  ngOnInit(): void {
    const projectIri = `http://rdfh.ch/projects/${this.uuid}`;
    this._searchState.setState({
      ontologies: [],
      ontologiesLoading: false,
      resourceClasses: [],
      resourceClassesLoading: false,
      selectedProject: this.uuid ? projectIri : undefined,
      selectedOntology: undefined,
      selectedResourceClass: undefined,
      propertyFormList: [EMPTY_PROPERTY_FORM_ITEM],
      properties: [],
      propertiesLoading: false,
      propertiesOrderByList: [],
      filteredProperties: [],
      matchResourceClassesLoading: false,
      resourcesSearchResultsLoading: false,
      resourcesSearchResultsCount: 0,
      resourcesSearchNoResults: false,
      resourcesSearchResultsPageNumber: 0,
      resourcesSearchResults: [],
    });

    this._searchState.ontologiesList(this.selectedProject$);

    this._searchState.resourceClassesList(this._searchState.selectedOntology$);

    this._searchState.propertiesList(this._searchState.selectedOntology$);

    this._searchState.filteredPropertiesList();

    const searchStored = localStorage.getItem('advanced-search-previous-search');
    if (searchStored) {
      this.previousSearchObject = JSON.parse(searchStored)[projectIri];
    }
  }

  handleRemovePropertyForm(property: PropertyFormItem): void {
    this._searchState.deletePropertyForm(property);
  }

  handleSearchButtonClicked(): void {
    this.propertyFormList$.pipe(take(1)).subscribe(propertyFormList => {
      // Filter out empty property forms (forms without a selected property)
      const nonEmptyProperties = propertyFormList.filter(prop => prop.selectedProperty);

      const queryObject: QueryObject = {
        query: this._searchState.onSearch(),
        properties: nonEmptyProperties,
      };

      this.emitGravesearchQuery.emit(queryObject);
    });
  }

  handleResetButtonClicked(): void {
    this._dialogService.afterConfirmation('Are you sure you want to reset the form?').subscribe(() => {
      this._searchState.reset();
    });
  }

  loadPreviousSearch(): void {
    if (!this.previousSearchObject) return;

    this._searchState.setState({
      ontologies: this.previousSearchObject.ontologies,
      ontologiesLoading: false,
      resourceClasses: this.previousSearchObject.resourceClasses,
      resourceClassesLoading: false,
      selectedProject: this.previousSearchObject.selectedProject,
      selectedOntology: this.previousSearchObject.selectedOntology,
      selectedResourceClass: this.previousSearchObject.selectedResourceClass,
      propertyFormList: this.previousSearchObject.propertyFormList,
      properties: this.previousSearchObject.properties,
      propertiesLoading: false,
      propertiesOrderByList: this.previousSearchObject.propertiesOrderByList,
      filteredProperties: this.previousSearchObject.filteredProperties,
      matchResourceClassesLoading: false,
      resourcesSearchResultsLoading: false,
      resourcesSearchResultsCount: 0,
      resourcesSearchNoResults: false,
      resourcesSearchResultsPageNumber: 0,
      resourcesSearchResults: [],
    });
  }

  // Get the list of child properties of a linked resource
  getLinkMatchPropertyFormItems(value: string | PropertyFormItem[] | undefined): PropertyFormItem[] | undefined {
    if (Array.isArray(value)) {
      return value;
    } else {
      return undefined;
    }
  }
}
