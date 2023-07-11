import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';

export interface AdvancedSearchState {
    ontologies: string[];
    resourceClasses: string[];
    selectedOntology: string | undefined;
    selectedResourceClass: string | undefined;
    propertyFormList: PropertyFormItem[];
    properties: string[];
}

export interface PropertyFormItem {
    id: string;
    selectedProperty: string | undefined;
}

@Injectable()
export class AdvancedSearchStoreService extends ComponentStore<AdvancedSearchState> {

    ontologies$: Observable<string[]> = this.select((state) => state.ontologies);
    resourceClasses$: Observable<string[]> = this.select((state) => state.resourceClasses);
    selectedOntology$: Observable<string | undefined> = this.select((state) => state.selectedOntology);
    selectedResourceClass$: Observable<string | undefined> = this.select((state) => state.selectedResourceClass);
    propertyFormList$: Observable<PropertyFormItem[]> = this.select((state) => state.propertyFormList);
    properties$: Observable<string[]> = this.select((state) => state.properties);

    /** combined selectors */

    // search button is disabled if no ontology and no resource class is selected
    searchButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        this.propertyFormList$,
        (ontology, propertyFormList) => !(ontology && propertyFormList.length && propertyFormList.every(prop => !!prop.selectedProperty))
    );

    // add button is disabled if no ontology is selected
    addButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        (ontology) => !ontology
    );

    // reset button is disabled if no ontology and no resource class is selected and the list of property forms is empty
    resetButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        this.selectedResourceClass$,
        this.propertyFormList$,
        (ontology, resourceClass, propertyFormList) => !(ontology || resourceClass || propertyFormList.length)
    );

    updateSelectedOntology(ontology: string): void {
        this.patchState({ selectedOntology: ontology });
    }

    updateSelectedResourceClass(resourceClass: string): void {
        this.patchState({ selectedResourceClass: resourceClass });
    }

    updatePropertyFormList(operation: 'add' | 'delete', property: PropertyFormItem): void {
        const currentPropertyFormList = this.get((state) => state.propertyFormList);
        let updatedPropertyFormList: PropertyFormItem[];

        if (operation === 'add') {
            updatedPropertyFormList = [...currentPropertyFormList, property];
        } else {
            updatedPropertyFormList = currentPropertyFormList.filter(item => item !== property);
        }
        console.log('updated list:', updatedPropertyFormList);
        this.patchState({ propertyFormList: updatedPropertyFormList });
    }

    updateSelectedProperty(property: PropertyFormItem): void {
        const currentPropertyFormList = this.get((state) => state.propertyFormList);
        const index = currentPropertyFormList.indexOf(property);

        if (index > -1) {  // Only update if the property is found
            const updatedPropertyFormList = [
                ...currentPropertyFormList.slice(0, index),  // Elements before the one to update
                property,  // The updated property
                ...currentPropertyFormList.slice(index + 1)  // Elements after the one to update
            ];

            this.patchState({ propertyFormList: updatedPropertyFormList });
        }
    }

    onSearch() {
        const selectedOntology = this.get((state) => state.selectedOntology);
        const selectedResourceClass = this.get((state) => state.selectedResourceClass);
        const propertyFormList = this.get((state) => state.propertyFormList);
        console.log('selectedOnto:', selectedOntology);
        console.log('selectedResClass:', selectedResourceClass);
        propertyFormList.forEach((prop) => console.log('prop:', prop));
    }

    onReset() {
        this.patchState({ selectedOntology: undefined });
        this.patchState({ selectedResourceClass: undefined });
        this.patchState({ propertyFormList: [] });
    }
}
