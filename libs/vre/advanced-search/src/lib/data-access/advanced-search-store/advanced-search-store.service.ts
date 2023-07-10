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

    // search button is disabled if no ontology and no resource class are selected
    searchButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        this.selectedResourceClass$,
        (ontology, resourceClass) => !(ontology && resourceClass)
    );

    updateSelectedOntology(ontology: string): void {
        this.patchState({ selectedOntology: ontology });
    }

    updateSelectedResourceClass(resourceClass: string): void {
        this.patchState({ selectedResourceClass: resourceClass });
    }

    updatePropertyFormList(operation: 'add' | 'delete', property: PropertyFormItem): void {
        const currentPropertyFormList = this.get((state) => state.propertyFormList);
        if (operation === 'add') {
            currentPropertyFormList.push(property);
        } else {
            const index = currentPropertyFormList.indexOf(property);
            currentPropertyFormList.splice(index, 1);
        }
        console.log('currentPropFormList:', currentPropertyFormList);
        this.patchState({ propertyFormList: currentPropertyFormList });
    }

    updateSelectedProperty(property: PropertyFormItem): void {
        const currentPropertyFormList = this.get((state) => state.propertyFormList);
        // todo: figure out how this actually works
        const index = currentPropertyFormList.indexOf(property);
        currentPropertyFormList[index] = property;
        console.log('updated:', currentPropertyFormList);
        this.patchState({ propertyFormList: currentPropertyFormList });
    }

    onSearch() {
        const selectedOntology = this.get((state) => state.selectedOntology);
        const selectedResourceClass = this.get((state) => state.selectedResourceClass);
        const propertyFormList = this.get((state) => state.propertyFormList);
        console.log('selectedOnto:', selectedOntology);
        console.log('selectedResClass:', selectedResourceClass);
        propertyFormList.forEach((prop) => console.log('prop:', prop));
    }
}
