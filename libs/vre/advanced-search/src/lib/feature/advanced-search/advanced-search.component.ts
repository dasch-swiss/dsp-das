import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OntologyResourceFormComponent } from '../../ui/ontology-resource-form/ontology-resource-form.component';
import { AdvancedSearchStoreService, PropertyFormItem, SearchItem } from '../../data-access/advanced-search-store/advanced-search-store.service';
import { PropertyFormComponent } from '../../ui/property-form/property-form.component';
import { FormActionsComponent } from '../../ui/form-actions/form-actions.component';
import { ApiData } from '../../data-access/advanced-search-service/advanced-search.service';
import { Constants } from '@dasch-swiss/dsp-js';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'dasch-swiss-advanced-search',
    standalone: true,
    imports: [CommonModule, OntologyResourceFormComponent, PropertyFormComponent, FormActionsComponent],
    providers: [AdvancedSearchStoreService],
    templateUrl: './advanced-search.component.html',
    styleUrls: ['./advanced-search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvancedSearchComponent implements OnInit {

    store: AdvancedSearchStoreService = inject(AdvancedSearchStoreService);

    ontologies$ = this.store.ontologies$;
    resourceClasses$ = this.store.resourceClasses$;
    selectedProject$ = this.store.selectedProject$;
    selectedOntology$ = this.store.selectedOntology$;
    selectedResourceClass$ = this.store.selectedResourceClass$;
    propertyFormList$ = this.store.propertyFormList$;
    properties$ = this.store.properties$;
    filteredProperties$ = this.store.filteredProperties$;
    searchButtonDisabled$ = this.store.searchButtonDisabled$;
    addButtonDisabled$ = this.store.addButtonDisabled$;
    resetButtonDisabled$ = this.store.resetButtonDisabled$;
    resourcesSearchResultsLoading$ = this.store.resourcesSearchResultsLoading$;
    resourcesSearchResultsCount$ = this.store.resourcesSearchResultsCount$;
    resourcesSearchResults$ = this.store.resourcesSearchResults$;

    constants = Constants;

    constructor(private _route: ActivatedRoute) {}

    ngOnInit(): void {
        const uuid: string = this._route.snapshot.parent?.params['uuid'];

        this.store.setState({
            ontologies: [],
            resourceClasses: [],
            selectedProject: uuid ? 'http://rdfh.ch/projects/' + uuid : undefined,
            selectedOntology: undefined,
            selectedResourceClass: undefined,
            propertyFormList: [],
            properties: [],
            filteredProperties: [],
            resourcesSearchResultsLoading: false,
            resourcesSearchResultsCount: 0,
            resourcesSearchResults: [],
        });

        // BEOL: yTerZGyxjZVqFMNNKXCDPF
        // Eric: GRlCJl3iSW2JeIt3V22rPA
        // this.store.ontologiesList('http://rdfh.ch/projects/yTerZGyxjZVqFMNNKXCDPF');
        this.store.ontologiesList(this.selectedProject$);

        this.store.resourceClassesList(this.selectedOntology$);

        this.store.propertiesList(this.selectedOntology$);

        this.store.filteredPropertiesList(this.selectedResourceClass$);
    }

    // pass-through method to notify the store to update the state of the selected ontology
    handleSelectedOntology(ontology: ApiData): void {
        this.store.updateSelectedOntology(ontology);
    }

    // pass-through method to notify the store to update the state of the selected resource class
    handleSelectedResourceClass(resourceClass: ApiData): void {
        this.store.updateSelectedResourceClass(resourceClass);
    }

    handleAddPropertyForm(): void {
        // mock uuid using timestamp
        const uuid = Date.now().toString();

        this.store.updatePropertyFormList('add', { id: uuid, selectedProperty: undefined, selectedOperator: undefined, searchValue: undefined, operators: [], list: undefined });
    }

    handleRemovePropertyForm(property: PropertyFormItem): void {
        this.store.updatePropertyFormList('delete', property);
    }

    handlePropertyFormItemChanged(property: PropertyFormItem): void {
        // if the selected property is a linked resource
        if(!(property.selectedProperty?.objectType.includes(this.constants.KnoraApiV2))) {
            // reset the search results
            this.store.resetResourcesSearchResults();
        }
        this.store.updatePropertyFormItem(property);
    }

    handleResourceSearchValueChanged(searchItem: SearchItem): void {
        this.store.updateResourcesSearchResults(searchItem);
    }

    handleSearchButtonClicked(): void {
        this.store.onSearch();
    }

    handleResetButtonClicked(): void {
        this.store.onReset();
    }

}
