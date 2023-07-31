import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { EMPTY, Observable } from 'rxjs';
import { AdvancedSearchService, ApiData, PropertyData } from '../advanced-search-service/advanced-search.service';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Constants, ListNodeV2 } from '@dasch-swiss/dsp-js';

export interface AdvancedSearchState {
    ontologies: ApiData[];
    resourceClasses: ApiData[];
    selectedOntology: ApiData | undefined;
    selectedResourceClass: ApiData | undefined;
    propertyFormList: PropertyFormItem[];
    properties: PropertyData[];
    filteredProperties: PropertyData[];
    resourcesSearchResults: ApiData[];
    error?: any;
}

export interface PropertyFormItem {
    id: string;
    selectedProperty: PropertyData | undefined;
    selectedOperator: string | undefined;
    searchValue: string | undefined;
    operators: string[] | undefined;
    list: ListNodeV2 | undefined;
}

export interface SearchItem {
    value: string;
    objectType: string;
}

export enum Operators {
    Equals = 'equals',
    NotEquals = 'does not equal',
    Exists = 'exists',
    NotExists = 'does not exist',
    GreaterThan = 'greater than',
    GreaterThanEquals = 'greater than or equal to',
    LessThan = 'less than',
    LessThanEquals = 'less than or equal to',
    IsLike = 'is like',
    Matches = 'matches',
}

@Injectable()
export class AdvancedSearchStoreService extends ComponentStore<AdvancedSearchState> {

    ontologies$: Observable<ApiData[]> = this.select((state) => state.ontologies);
    resourceClasses$: Observable<ApiData[]> = this.select((state) => state.resourceClasses);
    selectedOntology$: Observable<ApiData | undefined> = this.select((state) => state.selectedOntology);
    selectedResourceClass$: Observable<ApiData | undefined> = this.select((state) => state.selectedResourceClass);
    propertyFormList$: Observable<PropertyFormItem[]> = this.select((state) => state.propertyFormList);
    properties$: Observable<PropertyData[]> = this.select((state) => state.properties);
    filteredProperties$: Observable<PropertyData[]> = this.select((state) => state.filteredProperties);
    resourcesSearchResults$: Observable<ApiData[]> = this.select((state) => state.resourcesSearchResults);

    /** combined selectors */

    // search button is disabled if:
    // no ontology and no resource class is selected
    // OR
    // an ontology is selected and the list of property forms is empty or at least one PropertyFormItem is invalid
    searchButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        this.selectedResourceClass$,
        this.propertyFormList$,
        (ontology, resourceClass, propertyFormList) => {
            const isOntologyUndefined = !ontology;
            const isResourceClassUndefined = !resourceClass;
            const isPropertyFormListEmpty = !propertyFormList.length;

            const areSomePropertyFormItemsInvalid =
                propertyFormList.some((prop) => {
                    // no property selected
                    if (!prop.selectedProperty)
                        return true;

                    // selected operator is 'exists' or 'does not exist'
                    if (prop.selectedOperator === Operators.Exists ||
                        prop.selectedOperator === Operators.NotExists)
                        return false;

                    // selected operator is NOT 'exists' or 'does not exist'
                    // AND
                    // search value is undefined or empty
                    if (!prop.searchValue || prop.searchValue === '')
                        return true;
                    return false;

                });

            if (!isPropertyFormListEmpty) { // list not empty
                // at least one PropertyFormItem is invalid or onto is undefined
                if (areSomePropertyFormItemsInvalid || isOntologyUndefined)
                    return true;

                // onto is defined, list not empty and all PropertyFormItems are valid
                return false;
            } else { // list empty
                // no onto or resclass selected
                if (isOntologyUndefined || isResourceClassUndefined)
                    return true;

                // onto and resclass are selected
                return false;
            }
        }
    );

    // add button is disabled if no ontology is selected
    addButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        (ontology) => (!ontology || ontology.iri === '')
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
        this.patchState({ selectedOntology: ontology });
        this.patchState({ selectedResourceClass: undefined });
        this.patchState({ filteredProperties: [] });
        this.patchState({ propertyFormList: [] });
    }

    updateSelectedResourceClass(resourceClass: ApiData): void {
        if (resourceClass) {
            this.patchState({ selectedResourceClass: resourceClass });
        } else { // 'none' was selected
            this.patchState({ selectedResourceClass: undefined });
            this.patchState({ filteredProperties: [] });
        }
        // this.patchState({ propertyFormList: [] });
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

    updatePropertyFormItem(property: PropertyFormItem): void {
        console.log('form item changed:', property);
        const currentPropertyFormList = this.get((state) => state.propertyFormList);
        const index = currentPropertyFormList.indexOf(property);

        if (index > -1) {  // only update if the property is found
            const objectType = property.selectedProperty?.objectType;
            let operators;
            // todo: this should probably only update when the selected property changes
            if (objectType) {
                // filter available operators based on the object type of the selected property
                operators = Array.from(this.getOperators().entries())
                    .filter(([_, values]) => values.includes(objectType))
                    .map(([key, _]) => key);

                // if there are no matching operators in the map it means it's a link property
                // i.e. http://0.0.0.0:3333/ontology/0801/newton/v2#letter
                if (!operators.length) {
                    operators = [
                        Operators.Equals,
                        Operators.NotEquals,
                        Operators.Exists,
                        Operators.NotExists,
                        Operators.Matches, // apparently this is only available at the top level but idk what that means right now
                    ];
                }
            }
            property.operators = operators;

            // make this better
            if (property.selectedProperty?.listIri) {
                this._advancedSearchService.getList(property.selectedProperty.listIri).subscribe(
                    (list) => {
                        property.list = list;

                        const updatedPropertyFormList = [
                            ...currentPropertyFormList.slice(0, index),  // elements before the one to update
                            property,  // the updated property
                            ...currentPropertyFormList.slice(index + 1)  // elements after the one to update
                        ];
                        this.patchState({ propertyFormList: updatedPropertyFormList });
                    });
            } else {
                const updatedPropertyFormList = [
                    ...currentPropertyFormList.slice(0, index),  // elements before the one to update
                    property,  // the updated property
                    ...currentPropertyFormList.slice(index + 1)  // elements after the one to update
                ];

                this.patchState({ propertyFormList: updatedPropertyFormList });
            }

        }
    }

    updateResourcesSearchResults(searchItem: SearchItem): void {
        if (searchItem.value && searchItem.value.length >= 3) {
            this._advancedSearchService.getResourcesList(searchItem.value, searchItem.objectType).subscribe(
                (resources) => this.patchState({ resourcesSearchResults: resources })
            );
        } else {
            this.patchState({ resourcesSearchResults: [] });
        }
    }

    resetResourcesSearchResults(): void {
        this.patchState({ resourcesSearchResults: [] });
    }

    // key: operator, value: allowed object types
    getOperators(): Map<string, string[]> {
        return new Map([
            [Operators.Equals, [Constants.TextValue, Constants.UriValue]],
            [Operators.NotEquals, [Constants.TextValue, Constants.UriValue]],
            [Operators.Exists, [Constants.TextValue, Constants.UriValue]],
            [Operators.NotExists, [Constants.TextValue, Constants.UriValue]],
            [Operators.GreaterThan, [Constants.IntValue, Constants.DecimalValue]],
            [Operators.GreaterThanEquals, [Constants.IntValue, Constants.DecimalValue]],
            [Operators.LessThan, [Constants.IntValue, Constants.DecimalValue]],
            [Operators.LessThanEquals, [Constants.IntValue, Constants.DecimalValue]],
            [Operators.IsLike, [Constants.TextValue]],
            [Operators.Matches, [Constants.TextValue]],
        ]);
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

    // load list of ontologies
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

    // load list of resource classes
    readonly resourceClassesList = this.effect((resourceClass$: Observable<ApiData | undefined>) =>
        resourceClass$.pipe(
            switchMap((resClass) => {
                if (!resClass) return EMPTY;
                return this._advancedSearchService
                    .resourceClassesList(resClass.iri)
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

    // load list of properties
    readonly propertiesList = this.effect((ontology$: Observable<ApiData | undefined>) =>
        ontology$.pipe(
            switchMap((onto) => {
                if (!onto) return EMPTY;
                return this._advancedSearchService
                    .propertiesList(onto.iri)
                    .pipe(
                        tap({
                            next: (response) => this.patchState({ properties: response }),
                            error: (error) => this.patchState({ error }),
                        }),
                        catchError(() => EMPTY)
                    );
            })
        )
    );

    // load list of filtered properties
    readonly filteredPropertiesList = this.effect((resourceClass$: Observable<ApiData | undefined>) =>
        resourceClass$.pipe(
            switchMap((resClass) => {
                if (!resClass) return EMPTY;
                return this._advancedSearchService
                    .filteredPropertiesList(resClass.iri)
                    .pipe(
                        tap({
                            next: (response) => this.patchState({ filteredProperties: response }),
                            error: (error) => this.patchState({ error }),
                        }),
                        catchError(() => EMPTY)
                    );
            })
        )
    );

    // readonly resourcesList = this.effect((propertyFormList$: Observable<PropertyFormItem[]>) =>
    //     propertyFormList$.pipe(
    //         switchMap((propertyFormList) => {
    //             if (!propertyFormList) return EMPTY;

    //             propertyFormList.forEach((prop) => {
    //                 if (prop.searchValue && prop.selectedProperty && !(prop.selectedProperty.objectType.includes(Constants.KnoraApiV2))) {
    //                     this._advancedSearchService.resourcesList(prop.searchValue, prop.selectedProperty.objectType).subscribe(
    //                         (resources) => {
    //                             console.log('data:', resources);
    //                             prop.resourcesList = resources;
    //                             // this.updatePropertyFormItem(prop);
    //                         }
    //                     );
    //                 }
    //             });
    //             return EMPTY;
    //         })
    //     )
    // );

}
