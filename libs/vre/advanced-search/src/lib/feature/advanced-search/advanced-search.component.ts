import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OntologyResourceFormComponent } from '../../ui/ontology-resource-form/ontology-resource-form.component';
import { AdvancedSearchStoreService, PropertyFormItem } from '../../data-access/advanced-search-store/advanced-search-store.service';
import { PropertyFormComponent } from '../../ui/property-form/property-form.component';
import { FormActionsComponent } from '../../ui/form-actions/form-actions.component';
import { ApiData } from '../../data-access/advanced-search-service/advanced-search.service';

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
    selectedOntology$ = this.store.selectedOntology$;
    selectedResourceClass$ = this.store.selectedResourceClass$;
    propertyFormList$ = this.store.propertyFormList$;
    properties$ = this.store.properties$;
    searchButtonDisabled$ = this.store.searchButtonDisabled$;
    addButtonDisabled$ = this.store.addButtonDisabled$;
    resetButtonDisabled$ = this.store.resetButtonDisabled$;

    ngOnInit(): void {
        // mock values for the time being
        this.store.setState({
            ontologies: [],
            resourceClasses: [],
            selectedOntology: { iri: '', label: '' },
            selectedResourceClass: undefined,
            propertyFormList: [],
            properties: ['prop1', 'prop2', 'prop3']
        });

        // hardcoded project for now
        this.store.ontologiesList('http://rdfh.ch/projects/yTerZGyxjZVqFMNNKXCDPF');

        this.store.resourceClassesList(this.selectedOntology$);
    }

    // pass-through method to notify the store to update the state of the selected ontology
    handleSelectedOntology(ontology: ApiData): void {
        this.store.updateSelectedOntology(ontology);
    }

    // pass-through method to notify the store to update the state of the selected resource class
    handleSelectedResourceClass(resourceClass: string): void {
        this.store.updateSelectedResourceClass(resourceClass);
    }

    handleAddPropertyForm(): void {
        // mock uuid using timestamp
        const uuid = Date.now().toString();
        this.store.updatePropertyFormList('add', { id: uuid, selectedProperty: undefined });
    }

    handleRemovePropertyForm(property: PropertyFormItem): void {
        this.store.updatePropertyFormList('delete', property);
    }

    handleSelectedProperty(property: PropertyFormItem): void {
        this.store.updateSelectedProperty(property);
    }

    handleSearchButtonClicked(): void {
        this.store.onSearch();
    }

    handleResetButtonClicked(): void {
        this.store.onReset();
    }

}
