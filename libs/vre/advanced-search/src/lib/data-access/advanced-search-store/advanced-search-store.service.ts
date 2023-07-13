import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { EMPTY, Observable, combineLatest, forkJoin, of } from 'rxjs';
import { AdvancedSearchService, ApiData } from '../advanced-search-service/advanced-search.service';
import { switchMap, tap, catchError } from 'rxjs/operators';

export interface AdvancedSearchState {
    ontologies: ApiData[];
    resourceClasses: ApiData[];
    selectedOntology: ApiData;
    selectedResourceClass: ApiData;
    propertyFormList: PropertyFormItem[];
    properties: ApiData[];
    error?: any;
}

export interface PropertyFormItem {
    id: string;
    selectedProperty: string | undefined;
}

@Injectable()
export class AdvancedSearchStoreService extends ComponentStore<AdvancedSearchState> {

    ontologies$: Observable<ApiData[]> = this.select((state) => state.ontologies);
    resourceClasses$: Observable<ApiData[]> = this.select((state) => state.resourceClasses);
    selectedOntology$: Observable<ApiData> = this.select((state) => state.selectedOntology);
    selectedResourceClass$: Observable<ApiData> = this.select((state) => state.selectedResourceClass);
    propertyFormList$: Observable<PropertyFormItem[]> = this.select((state) => state.propertyFormList);
    properties$: Observable<ApiData[]> = this.select((state) => state.properties);

    /** combined selectors */

    // search button is disabled if:
    // no ontology and no resource class is selected
    // OR
    // no ontology is selected and the list of property forms is empty or at least one selected property is undefined
    searchButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        this.selectedResourceClass$,
        this.propertyFormList$,
        (ontology, resourceClass, propertyFormList) => {
            const isOntologyUndefined = !ontology;
            const isResourceClassUndefined = !resourceClass;
            const isPropertyFormListEmpty = !propertyFormList.length;

            // returns true as soon as it encounters the first element where selectedProperty is undefined
            const areSomeSelectedPropertiesUndefined =
            propertyFormList.some((prop) => !prop.selectedProperty);

            if(!isPropertyFormListEmpty) { // list not empty
                // at least one selected property is undefined or onto is undefined
                if(areSomeSelectedPropertiesUndefined || isOntologyUndefined)
                    return true;

                // onto is defined, list not empty and all selected properties are defined
                return false;
            } else { // list empty
                // no onto or resclass selected
                if(isOntologyUndefined || isResourceClassUndefined)
                    return true;

                // onto and resclass are selected
                return false;
            }
        }
    );

    // add button is disabled if no ontology is selected
    addButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        (ontology) => (!ontology.iri || ontology.iri === '')
    );

    // reset button is disabled if no ontology and no resource class is selected and the list of property forms is empty
    resetButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        this.selectedResourceClass$,
        this.propertyFormList$,
        (ontology, resourceClass, propertyFormList) => !(ontology || resourceClass || propertyFormList.length)
    );

    constructor(private _advancedSearchService: AdvancedSearchService) {
        super();
    }

    updateSelectedOntology(ontology: ApiData): void {
        console.log('selected Onto:', ontology);
        this.patchState({ selectedOntology: ontology });
    }

    updateSelectedResourceClass(resourceClass: ApiData): void {
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

        this.patchState({ propertyFormList: updatedPropertyFormList });
    }

    updateSelectedProperty(property: PropertyFormItem): void {
        const currentPropertyFormList = this.get((state) => state.propertyFormList);
        const index = currentPropertyFormList.indexOf(property);

        if (index > -1) {  // only update if the property is found
            const updatedPropertyFormList = [
                ...currentPropertyFormList.slice(0, index),  // elements before the one to update
                property,  // the updated property
                ...currentPropertyFormList.slice(index + 1)  // elements after the one to update
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

    getProperties() {
        this._advancedSearchService.propertiesListLog(
            'http://0.0.0.0:3333/ontology/0801/beol/v2',
            'http://0.0.0.0:3333/ontology/0801/beol/v2#Archive'
        );
    }

    // intialize list of ontologies
    readonly ontologiesList = this.effect((ontologyIri$: Observable<string>) =>
        ontologyIri$.pipe(
            switchMap((iri) =>
                this._advancedSearchService.ontologiesList(iri).pipe(
                    tap({
                        next: (response) =>
                            this.patchState({ ontologies: response }),
                        error: (error) => this.patchState({ error }),
                    }),
                    catchError(() => EMPTY)
                )
            )
        )
    );

    readonly resourceClassesList = this.effect((resourceClassIri$: Observable<ApiData>) =>
        resourceClassIri$.pipe(
            switchMap((data) => {
                if (!data.iri) return EMPTY;
                return this._advancedSearchService
                    .resourceClassesList(data.iri)
                    .pipe(
                        tap({
                            next: (response) =>
                                this.patchState({ resourceClasses: response }),
                            error: (error) => this.patchState({ error }),
                        }),
                        catchError(() => EMPTY)
                    );
            })
        )
    );

    readonly propertiesList = this.effect((ontologyIri$: Observable<ApiData>) =>
        ontologyIri$.pipe(
            switchMap((onto) => {
                if (!onto.iri) return EMPTY;
                return this._advancedSearchService
                    .propertiesList(onto.iri, undefined)
                    .pipe(
                        tap({
                            next: (response) => {
                                console.log('response:', response);
                                this.patchState({ properties: response })
                            },
                            error: (error) => this.patchState({ error }),
                        }),
                        catchError(() => EMPTY)
                    );
            })
        )
    );

}
