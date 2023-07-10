import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OntologyResourceFormComponent } from '../../ui/ontology-resource-form/ontology-resource-form.component';
import { AdvancedSearchStoreService, PropertyFormItem } from '../../data-access/advanced-search-store/advanced-search-store.service';
import { FormActionsComponent } from '../../ui/form-actions/form-actions.component';
import { PropertyFormComponent } from '../../ui/property-form/property-form.component';

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

    ngOnInit(): void {
        // mock values for the time being
        this.store.setState({
            ontologies: ['onto1', 'onto2', 'onto3'],
            resourceClasses: ['res1', 'res2', 'res3'],
            selectedOntology: undefined,
            selectedResourceClass: undefined,
            propertyFormList: [],
            properties: ['prop1', 'prop2', 'prop3']
        });
    }

    // pass-through method to notify the store to update the state of the selected ontology
    handleSelectedOntology(ontology: string): void {
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

}
