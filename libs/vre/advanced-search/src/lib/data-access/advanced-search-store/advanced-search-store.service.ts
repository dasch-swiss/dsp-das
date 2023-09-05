import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { EMPTY, Observable } from 'rxjs';
import {
    AdvancedSearchService,
    ApiData,
    PropertyData,
    ResourceLabel,
} from '../advanced-search-service/advanced-search.service';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Constants, ListNodeV2 } from '@dasch-swiss/dsp-js';
import { v4 as uuidv4 } from 'uuid';
import { GravsearchService } from '../gravsearch-service/gravsearch.service';

export interface AdvancedSearchState {
    ontologies: ApiData[];
    ontologiesLoading: boolean;
    resourceClasses: ApiData[];
    resourceClassesLoading: boolean;
    selectedProject: string | undefined;
    selectedOntology: ApiData | undefined;
    selectedResourceClass: ApiData | undefined;
    propertyFormList: PropertyFormItem[];
    properties: PropertyData[];
    propertiesLoading: boolean;
    propertiesOrderByList: OrderByItem[];
    filteredProperties: PropertyData[];
    resourcesSearchResultsLoading: boolean;
    resourcesSearchResultsCount: number;
    resourcesSearchNoResults: boolean;
    resourcesSearchResultsPageNumber: number;
    resourcesSearchResults: ApiData[];
    error?: any;
}

export interface PropertyFormItem {
    id: string;
    selectedProperty: PropertyData | undefined;
    selectedOperator: string | undefined;
    searchValue: string | PropertyFormItem[] | undefined;
    operators: string[] | undefined;
    list: ListNodeV2 | undefined;
    isChildProperty?: boolean;
    childPropertiesList?: PropertyData[];
}

export interface SearchItem {
    value: string;
    objectType: string;
}

export interface OrderByItem {
    id: string;
    label: string;
    orderBy: boolean;
}

export interface ChildPropertyItem {
    parentProperty: PropertyFormItem;
    childProperty: PropertyFormItem;
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
    ontologies$: Observable<ApiData[]> = this.select(
        (state) => state.ontologies
    );
    ontologiesLoading$: Observable<boolean> = this.select(
        (state) => state.ontologiesLoading
    );
    resourceClasses$: Observable<ApiData[]> = this.select(
        (state) => state.resourceClasses
    );
    resourceClassesLoading$: Observable<boolean> = this.select(
        (state) => state.resourceClassesLoading
    );
    selectedProject$: Observable<string | undefined> = this.select(
        (state) => state.selectedProject
    );
    selectedOntology$: Observable<ApiData | undefined> = this.select(
        (state) => state.selectedOntology
    );
    selectedResourceClass$: Observable<ApiData | undefined> = this.select(
        (state) => state.selectedResourceClass
    );
    propertyFormList$: Observable<PropertyFormItem[]> = this.select(
        (state) => state.propertyFormList
    );
    propertiesOrderByList$: Observable<OrderByItem[]> = this.select(
        (state) => state.propertiesOrderByList
    );
    properties$: Observable<PropertyData[]> = this.select(
        (state) => state.properties
    );
    propertiesLoading$: Observable<boolean> = this.select(
        (state) => state.propertiesLoading
    );
    filteredProperties$: Observable<PropertyData[]> = this.select(
        (state) => state.filteredProperties
    );
    resourcesSearchResultsLoading$: Observable<boolean> = this.select(
        (state) => state.resourcesSearchResultsLoading
    );
    resourcesSearchResultsCount$: Observable<number> = this.select(
        (state) => state.resourcesSearchResultsCount
    );
    resourcesSearchNoResults$: Observable<boolean> = this.select(
        (state) => state.resourcesSearchNoResults
    );
    resourcesSearchResultsPageNumber$: Observable<number> = this.select(
        (state) => state.resourcesSearchResultsPageNumber
    );
    resourcesSearchResults$: Observable<ApiData[]> = this.select(
        (state) => state.resourcesSearchResults
    );

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

            const areSomePropertyFormItemsInvalid = propertyFormList.some(
                (prop) => this.isPropertyFormItemListInvalid(prop)
            );

            if (!isPropertyFormListEmpty) {
                // list not empty
                // at least one PropertyFormItem is invalid or onto is undefined
                if (areSomePropertyFormItemsInvalid || isOntologyUndefined)
                    return true;

                // onto is defined, list not empty and all PropertyFormItems are valid
                return false;
            } else {
                // list empty
                // no onto or resclass selected
                if (isOntologyUndefined || isResourceClassUndefined)
                    return true;

                // onto and resclass are selected
                return false;
            }
        }
    );

    orderByButtonDisabled$: Observable<boolean> = this.select(
        this.selectedResourceClass$,
        this.propertyFormList$,
        this.propertiesOrderByList$,
        (resourceClass, propertyFormList, orderBylist) => {
            const areSomePropertyFormItemsInvalid = propertyFormList.some(
                (prop) => {
                    // no property selected
                    if (!prop.selectedProperty) return true;
                    return false;
                }
            );
            return (
                !resourceClass ||
                !orderBylist.length ||
                !propertyFormList.length
            );
        }
    );

    // add button is disabled if no ontology is selected
    addButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        (ontology) => !ontology || ontology.iri === ''
    );

    // reset button is disabled if no ontology and no resource class is selected and the list of property forms is empty
    resetButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        this.selectedResourceClass$,
        this.propertyFormList$,
        (ontology, resourceClass, propertyFormList) =>
            !(ontology || resourceClass || propertyFormList.length)
    );

    constructor(
        private _advancedSearchService: AdvancedSearchService,
        private _gravsearchService: GravsearchService
    ) {
        super();
    }

    isPropertyFormItemListInvalid(prop: PropertyFormItem): boolean {
        // no property selected
        if (!prop.selectedProperty) return true;

        // selected operator is 'exists' or 'does not exist'
        if (
            prop.selectedOperator === Operators.Exists ||
            prop.selectedOperator === Operators.NotExists
        )
            return false;

        if (Array.isArray(prop.searchValue)) {
            if (!prop.searchValue.length) return true;

            return prop.searchValue.some((childProp) => {
                const temp = this.isPropertyFormItemListInvalid(childProp);
                return temp;
            });
        }

        // selected operator is NOT 'exists' or 'does not exist'
        // AND
        // search value is undefined or empty
        if (!prop.searchValue || prop.searchValue === '') return true;

        return false;
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
        } else {
            // 'none' was selected
            this.patchState({ selectedResourceClass: undefined });
            this.patchState({ filteredProperties: [] });
        }

        this.patchState({ propertyFormList: [] });
        this.patchState({ propertiesOrderByList: [] });
    }

    // use enum for operation
    updatePropertyFormList(
        operation: 'add' | 'delete',
        property: PropertyFormItem
    ): void {
        const currentPropertyFormList = this.get(
            (state) => state.propertyFormList
        );
        const currentOrderByList = this.get(
            (state) => state.propertiesOrderByList
        );
        let updatedPropertyFormList: PropertyFormItem[];
        let updatedOrderByList: OrderByItem[];

        if (operation === 'add') {
            updatedPropertyFormList = [...currentPropertyFormList, property];
        } else {
            updatedPropertyFormList = currentPropertyFormList.filter(
                (item) => item !== property
            );
            updatedOrderByList = currentOrderByList.filter(
                (item) => item.id !== property.id
            );

            this.patchState({ propertiesOrderByList: updatedOrderByList });
            console.log('orderByList:', updatedOrderByList);
        }

        console.log('prop form list:', updatedPropertyFormList);
        this.patchState({ propertyFormList: updatedPropertyFormList });
    }

    // use enum for operation
    addChildPropertyFormList(property: PropertyFormItem): void {
        const currentPropertyFormList = this.get(
            (state) => state.propertyFormList
        );

        const indexInPropertyFormList =
            currentPropertyFormList.indexOf(property);

        const currentSearchValue = currentPropertyFormList[
            indexInPropertyFormList
        ].searchValue as PropertyFormItem[];

        const uuid = uuidv4();

        const updatedSearchValue = [
            ...currentSearchValue,
            {
                id: uuid,
                selectedProperty: undefined,
                selectedOperator: undefined,
                searchValue: undefined,
                operators: [],
                list: undefined,
                isChildProperty: true,
            },
        ];

        const newProp = currentPropertyFormList[indexInPropertyFormList];
        newProp.searchValue = updatedSearchValue;

        this.updatePropertyFormListItem(
            currentPropertyFormList,
            newProp,
            indexInPropertyFormList
        );
    }

    deleteChildPropertyFormList(property: ChildPropertyItem): void {
        const currentPropertyFormList = this.get(
            (state) => state.propertyFormList
        );

        const indexInPropertyFormList = currentPropertyFormList.indexOf(
            property.parentProperty
        );

        const currentSearchValue = currentPropertyFormList[
            indexInPropertyFormList
        ].searchValue as PropertyFormItem[];

        const updatedSearchValue = currentSearchValue.filter(
            (item) => item.id !== property.childProperty.id
        );

        const newProp = currentPropertyFormList[indexInPropertyFormList];
        newProp.searchValue = updatedSearchValue;

        this.updatePropertyFormListItem(
            currentPropertyFormList,
            newProp,
            indexInPropertyFormList
        );
    }

    updateSelectedProperty(property: PropertyFormItem): void {
        const currentPropertyFormList = this.get(
            (state) => state.propertyFormList
        );
        const indexInPropertyFormList =
            currentPropertyFormList.indexOf(property);

        const currentOrderByList = this.get(
            (state) => state.propertiesOrderByList
        );
        const indexInCurrentOrderByList = currentOrderByList.findIndex(
            (item) => item.id === property.id
        );

        if (indexInPropertyFormList > -1) {
            // only update if the property is found
            const objectType = property.selectedProperty?.objectType;
            let operators;

            if (objectType) {
                // filter available operators based on the object type of the selected property
                operators = Array.from(this.getOperators().entries())
                    .filter(([_, values]) => values.includes(objectType))
                    .map(([key, _]) => key);

                // if there are no matching operators in the map it means the property is a linked resource
                // i.e. http://0.0.0.0:3333/ontology/0801/newton/v2#letter
                if (!operators.length) {
                    operators = [
                        Operators.Equals,
                        Operators.NotEquals,
                        Operators.Exists,
                        Operators.NotExists,
                        Operators.Matches,
                    ];
                }
            }
            property.operators = operators;

            // reset selected operator and search value because it might be invalid for the newly selected property
            property.selectedOperator = undefined;
            property.searchValue = undefined;

            if (property.selectedProperty?.listIri) {
                this._advancedSearchService
                    .getList(property.selectedProperty.listIri)
                    .subscribe((list) => {
                        property.list = list;
                        this.updatePropertyFormListItem(
                            currentPropertyFormList,
                            property,
                            indexInPropertyFormList
                        );
                    });
            } else {
                this.updatePropertyFormListItem(
                    currentPropertyFormList,
                    property,
                    indexInPropertyFormList
                );
            }
        }

        // do not add linked resource properties to orderByList because it's currently not possible
        // https://linear.app/dasch/issue/DEV-2607/gravsearch-order-by-linked-resource-issue
        if (
            property.selectedProperty?.objectType === Constants.Label ||
            property.selectedProperty?.objectType.includes(Constants.KnoraApiV2)
        ) {
            let updatedOrderByList = [];
            if (indexInCurrentOrderByList > -1) {
                updatedOrderByList = [
                    ...currentOrderByList.slice(0, indexInCurrentOrderByList),
                    {
                        id: property.id,
                        label: property.selectedProperty?.label || '',
                        orderBy: false,
                    },
                    ...currentOrderByList.slice(indexInCurrentOrderByList + 1),
                ];
            } else {
                updatedOrderByList = [
                    ...currentOrderByList,
                    {
                        id: property.id,
                        label: property.selectedProperty?.label || '',
                        orderBy: false,
                    },
                ];
            }

            this.patchState({ propertiesOrderByList: updatedOrderByList });
        } else {
            // if selected property is changed to a linked resource property
            // remove from orderByList
            // this should be removed once the bug is fixed
            const updatedOrderByList = currentOrderByList.filter(
                (item) => item.id !== property.id
            );

            this.patchState({ propertiesOrderByList: updatedOrderByList });
        }
    }

    updateSelectedOperator(property: PropertyFormItem): void {
        const currentPropertyFormList = this.get(
            (state) => state.propertyFormList
        );
        const index = currentPropertyFormList.indexOf(property);

        if (index > -1) {
            // reset search value if operator is 'exists' or 'does not exist'
            if (
                property.selectedOperator === Operators.Exists ||
                property.selectedOperator === Operators.NotExists
            ) {
                property.searchValue = undefined;
            }

            if (
                property.selectedOperator === Operators.Matches &&
                property.selectedProperty?.objectType &&
                property.selectedProperty?.objectType !== Constants.Label
            ) {
                // maybe this should be takeOne
                this._advancedSearchService
                    .filteredPropertiesList(
                        property.selectedProperty?.objectType
                    )
                    .subscribe((properties) => {
                        property.childPropertiesList = properties;
                        property.searchValue = [];
                        this.updatePropertyFormListItem(
                            currentPropertyFormList,
                            property,
                            index
                        );
                    });
            } else {
                this.updatePropertyFormListItem(
                    currentPropertyFormList,
                    property,
                    index
                );
            }
        }
    }

    updateSearchValue(property: PropertyFormItem): void {
        const currentPropertyFormList = this.get(
            (state) => state.propertyFormList
        );
        const index = currentPropertyFormList.indexOf(property);

        if (index > -1) {
            this.updatePropertyFormListItem(
                currentPropertyFormList,
                property,
                index
            );
        }
    }

    updatePropertyFormListItem(
        propertyFormList: PropertyFormItem[],
        property: PropertyFormItem,
        index: number
    ): void {
        const updatedPropertyFormList = [
            ...propertyFormList.slice(0, index),
            property,
            ...propertyFormList.slice(index + 1),
        ];

        this.patchState({ propertyFormList: updatedPropertyFormList });
    }

    updateResourcesSearchResults(searchItem: SearchItem): void {
        if (searchItem.value && searchItem.value.length >= 3) {
            this.patchState({ resourcesSearchResultsLoading: true });
            this.patchState({ resourcesSearchResults: [] });
            this.patchState({ resourcesSearchResultsPageNumber: 0 });
            this._advancedSearchService
                .getResourceListCount(searchItem.value, searchItem.objectType)
                .subscribe((count) => {
                    this.patchState({ resourcesSearchResultsCount: count });
                    this.patchState({ resourcesSearchResultsLoading: false });
                    this.patchState({ resourcesSearchNoResults: false });
                    // since we have the count, we don't need to execute the search if there are no results
                    if (count > 0) {
                        this.patchState({
                            resourcesSearchResultsLoading: true,
                        });
                        // not ideal to do it this way but we should get the count before executing the search
                        this._advancedSearchService
                            .getResourcesList(
                                searchItem.value,
                                searchItem.objectType
                            )
                            .subscribe((resources) => {
                                this.patchState({
                                    resourcesSearchResults: resources,
                                });
                                this.patchState({
                                    resourcesSearchResultsLoading: false,
                                });
                            });
                    } else {
                        this.patchState({
                            resourcesSearchNoResults: true,
                        });
                    }
                });
        } else {
            this.patchState({ resourcesSearchResultsCount: 0 });
            this.patchState({ resourcesSearchResults: [] });
        }
    }

    updatePropertyOrderBy(orderByList: OrderByItem[]): void {
        this.patchState({ propertiesOrderByList: orderByList });
    }

    updateChildSelectedProperty(property: ChildPropertyItem): void {
        const currentPropertyFormList = this.get(
            (state) => state.propertyFormList
        );
        const indexInPropertyFormList = currentPropertyFormList.indexOf(
            property.parentProperty
        );

        const currentSearchValue = currentPropertyFormList[
            indexInPropertyFormList
        ].searchValue as PropertyFormItem[];

        const indexInCurrentSearchValue = currentSearchValue.findIndex(
            (item) => item.id === property.childProperty.id
        );

        if (indexInCurrentSearchValue > -1) {
            // only update if the property is found
            const objectType =
                property.childProperty.selectedProperty?.objectType;

            let operators;

            if (objectType) {
                // filter available operators based on the object type of the selected property
                operators = Array.from(this.getOperators().entries())
                    .filter(([_, values]) => values.includes(objectType))
                    .map(([key, _]) => key);

                // if there are no matching operators in the map it means the property is a linked resource
                // i.e. http://0.0.0.0:3333/ontology/0801/newton/v2#letter
                if (!operators.length) {
                    operators = [
                        Operators.Equals,
                        Operators.NotEquals,
                        Operators.Exists,
                        Operators.NotExists,
                    ];
                }
            }
            property.childProperty.operators = operators;

            const newProp = currentPropertyFormList[indexInPropertyFormList];
            newProp.searchValue = [
                ...currentSearchValue.slice(0, indexInCurrentSearchValue),
                property.childProperty,
                ...currentSearchValue.slice(indexInCurrentSearchValue + 1),
            ];

            // reset selected operator and search value because it might be invalid for the newly selected property
            property.childProperty.selectedOperator = undefined;
            property.childProperty.searchValue = undefined;

            if (property.childProperty.selectedProperty?.listIri) {
                // this should be a takeOne
                this._advancedSearchService
                    .getList(property.childProperty.selectedProperty?.listIri)
                    .subscribe((list) => {
                        property.childProperty.list = list;
                        newProp.searchValue = [
                            ...currentSearchValue.slice(
                                0,
                                indexInCurrentSearchValue
                            ),
                            property.childProperty,
                            ...currentSearchValue.slice(
                                indexInCurrentSearchValue + 1
                            ),
                        ];

                        this.updatePropertyFormListItem(
                            currentPropertyFormList,
                            newProp,
                            indexInPropertyFormList
                        );
                    });
            } else {
                newProp.searchValue = [
                    ...currentSearchValue.slice(0, indexInCurrentSearchValue),
                    property.childProperty,
                    ...currentSearchValue.slice(indexInCurrentSearchValue + 1),
                ];

                this.updatePropertyFormListItem(
                    currentPropertyFormList,
                    newProp,
                    indexInPropertyFormList
                );
            }
        }
    }

    updateChildSelectedOperator(property: ChildPropertyItem): void {
        const currentPropertyFormList = this.get(
            (state) => state.propertyFormList
        );
        const indexInPropertyFormList = currentPropertyFormList.indexOf(
            property.parentProperty
        );

        const currentSearchValue = currentPropertyFormList[
            indexInPropertyFormList
        ].searchValue as PropertyFormItem[];

        const indexInCurrentSearchValue = currentSearchValue.findIndex(
            (item) => item.id === property.childProperty.id
        );

        if (indexInPropertyFormList > -1 && indexInCurrentSearchValue > -1) {
            // reset search value if operator is 'exists' or 'does not exist'
            if (
                property.childProperty.selectedOperator === Operators.Exists ||
                property.childProperty.selectedOperator === Operators.NotExists
            ) {
                property.childProperty.searchValue = undefined;
            }

            property.parentProperty.searchValue = [
                ...currentSearchValue.slice(0, indexInCurrentSearchValue),
                property.childProperty,
                ...currentSearchValue.slice(indexInCurrentSearchValue + 1),
            ];

            this.updatePropertyFormListItem(
                currentPropertyFormList,
                property.parentProperty,
                indexInPropertyFormList
            );
        }
    }

    updateChildValue(property: ChildPropertyItem): void {
        const currentPropertyFormList = this.get(
            (state) => state.propertyFormList
        );
        const indexInPropertyFormList = currentPropertyFormList.indexOf(
            property.parentProperty
        );

        const currentSearchValue = currentPropertyFormList[
            indexInPropertyFormList
        ].searchValue as PropertyFormItem[];

        const indexInCurrentSearchValue = currentSearchValue.findIndex(
            (item) => item.id === property.childProperty.id
        );

        if (indexInPropertyFormList > -1 && indexInCurrentSearchValue > -1) {
            property.parentProperty.searchValue = [
                ...currentSearchValue.slice(0, indexInCurrentSearchValue),
                property.childProperty,
                ...currentSearchValue.slice(indexInCurrentSearchValue + 1),
            ];

            this.updatePropertyFormListItem(
                currentPropertyFormList,
                property.parentProperty,
                indexInPropertyFormList
            );
        }
    }

    resetResourcesSearchResults(): void {
        this.patchState({ resourcesSearchResults: [] });
        this.patchState({ resourcesSearchResultsCount: 0 });
        this.patchState({ resourcesSearchResultsPageNumber: 0 });
    }

    loadMoreResourcesSearchResults(searchItem: SearchItem): void {
        const count = this.get((state) => state.resourcesSearchResultsCount);
        const results = this.get((state) => state.resourcesSearchResults);

        // only load more results if there are more results to load
        if (count > results.length) {
            const nextPageNumber =
                this.get((state) => state.resourcesSearchResultsPageNumber) + 1;
            this.patchState({ resourcesSearchResultsLoading: true });
            this._advancedSearchService
                .getResourcesList(
                    searchItem.value,
                    searchItem.objectType,
                    nextPageNumber
                )
                .subscribe((resources) => {
                    this.patchState({
                        resourcesSearchResultsPageNumber: nextPageNumber,
                    });
                    const newResourcesSearchResults = this.get((state) =>
                        state.resourcesSearchResults.concat(resources)
                    );
                    this.patchState({
                        resourcesSearchResults: newResourcesSearchResults,
                    });
                    this.patchState({ resourcesSearchResultsLoading: false });
                });
        }
    }

    // key: operator, value: allowed object types
    getOperators(): Map<string, string[]> {
        return new Map([
            [
                Operators.Equals,
                [
                    ResourceLabel,
                    Constants.TextValue,
                    Constants.IntValue,
                    Constants.DecimalValue,
                    Constants.BooleanValue,
                    Constants.DateValue,
                    Constants.UriValue,
                    Constants.ListValue,
                ],
            ],
            [
                Operators.NotEquals,
                [
                    ResourceLabel,
                    Constants.TextValue,
                    Constants.IntValue,
                    Constants.DecimalValue,
                    Constants.DateValue,
                    Constants.UriValue,
                    Constants.ListValue,
                ],
            ],
            [
                Operators.Exists,
                [
                    Constants.TextValue,
                    Constants.IntValue,
                    Constants.DecimalValue,
                    Constants.BooleanValue,
                    Constants.DateValue,
                    Constants.UriValue,
                    Constants.ListValue,
                    Constants.GeomValue,
                    Constants.FileValue,
                    Constants.AudioFileValue,
                    Constants.StillImageFileValue,
                    Constants.DDDFileValue,
                    Constants.MovingImageFileValue,
                    Constants.TextFileValue,
                    Constants.ColorValue,
                    Constants.IntervalValue,
                    Constants.GeonameValue,
                    Constants.TimeValue,
                ],
            ],
            [
                Operators.NotExists,
                [
                    Constants.TextValue,
                    Constants.IntValue,
                    Constants.DecimalValue,
                    Constants.BooleanValue,
                    Constants.DateValue,
                    Constants.UriValue,
                    Constants.ListValue,
                    Constants.GeomValue,
                    Constants.FileValue,
                    Constants.AudioFileValue,
                    Constants.StillImageFileValue,
                    Constants.DDDFileValue,
                    Constants.MovingImageFileValue,
                    Constants.TextFileValue,
                    Constants.ColorValue,
                    Constants.IntervalValue,
                    Constants.GeonameValue,
                    Constants.TimeValue,
                ],
            ],
            [
                Operators.GreaterThan,
                [
                    Constants.IntValue,
                    Constants.IntValue,
                    Constants.DateValue,
                    Constants.DecimalValue,
                ],
            ],
            [
                Operators.GreaterThanEquals,
                [
                    Constants.IntValue,
                    Constants.DecimalValue,
                    Constants.DateValue,
                ],
            ],
            [
                Operators.LessThan,
                [
                    Constants.IntValue,
                    Constants.DecimalValue,
                    Constants.DateValue,
                ],
            ],
            [
                Operators.LessThanEquals,
                [
                    Constants.IntValue,
                    Constants.DecimalValue,
                    Constants.DateValue,
                ],
            ],
            [Operators.IsLike, [ResourceLabel, Constants.TextValue]],
            [Operators.Matches, [ResourceLabel, Constants.TextValue]],
        ]);
    }

    onSearch(): string {
        const selectedResourceClass = this.get(
            (state) => state.selectedResourceClass
        );
        const propertyFormList = this.get((state) => state.propertyFormList);
        const orderByList = this.get((state) => state.propertiesOrderByList);

        return this._gravsearchService.generateGravSearchQuery(
            selectedResourceClass?.iri,
            propertyFormList,
            orderByList
        );
    }

    onReset() {
        this.patchState({ selectedOntology: undefined });
        this.patchState({ selectedResourceClass: undefined });
        this.patchState({ propertyFormList: [] });
        this.patchState({ propertiesOrderByList: [] });
    }

    // load list of ontologies
    readonly ontologiesList = this.effect(
        (ontologyIri$: Observable<string | undefined>) =>
            ontologyIri$.pipe(
                switchMap((iri) => {
                    this.patchState({ ontologiesLoading: true });
                    if (!iri) {
                        // no project iri, get all ontologies
                        return this._advancedSearchService
                            .allOntologiesList()
                            .pipe(
                                tap({
                                    next: (response) => {
                                        this.patchState({
                                            ontologies: response,
                                        });
                                        this.patchState({
                                            ontologiesLoading: false,
                                        });
                                    },
                                    error: (error) => {
                                        this.patchState({ error });
                                        this.patchState({
                                            ontologiesLoading: false,
                                        });
                                    },
                                }),
                                catchError(() => {
                                    this.patchState({
                                        ontologiesLoading: false,
                                    });
                                    return EMPTY;
                                })
                            );
                    }
                    // project iri, get ontologies in project
                    return this._advancedSearchService
                        .ontologiesInProjectList(iri)
                        .pipe(
                            tap({
                                next: (response) => {
                                    this.patchState({ ontologies: response });
                                    this.patchState({
                                        selectedOntology: response[0],
                                    });
                                    this.patchState({
                                        ontologiesLoading: false,
                                    });
                                },
                                error: (error) => {
                                    this.patchState({ error });
                                    this.patchState({
                                        ontologiesLoading: false,
                                    });
                                },
                            }),
                            catchError(() => {
                                this.patchState({ ontologiesLoading: false });
                                return EMPTY;
                            })
                        );
                })
            )
    );

    // load list of resource classes
    readonly resourceClassesList = this.effect(
        (resourceClass$: Observable<ApiData | undefined>) =>
            resourceClass$.pipe(
                switchMap((resClass) => {
                    this.patchState({ resourceClassesLoading: true });
                    if (!resClass) {
                        this.patchState({ resourceClassesLoading: false });
                        return EMPTY;
                    }
                    return this._advancedSearchService
                        .resourceClassesList(resClass.iri)
                        .pipe(
                            tap({
                                next: (response) => {
                                    this.patchState({
                                        resourceClasses: response,
                                    });
                                    this.patchState({
                                        resourceClassesLoading: false,
                                    });
                                },
                                error: (error) => {
                                    this.patchState({ error });
                                    this.patchState({
                                        resourceClassesLoading: false,
                                    });
                                },
                            }),
                            catchError(() => {
                                this.patchState({
                                    resourceClassesLoading: false,
                                });
                                return EMPTY;
                            })
                        );
                })
            )
    );

    // load list of properties
    readonly propertiesList = this.effect(
        (ontology$: Observable<ApiData | undefined>) =>
            ontology$.pipe(
                switchMap((onto) => {
                    this.patchState({ propertiesLoading: true });
                    if (!onto) {
                        this.patchState({ propertiesLoading: false });
                        return EMPTY;
                    }
                    return this._advancedSearchService
                        .propertiesList(onto.iri)
                        .pipe(
                            tap({
                                next: (response) => {
                                    this.patchState({ properties: response });
                                    this.patchState({
                                        propertiesLoading: false,
                                    });
                                },
                                error: (error) => {
                                    this.patchState({ error });
                                    this.patchState({
                                        propertiesLoading: false,
                                    });
                                },
                            }),
                            catchError(() => {
                                this.patchState({ propertiesLoading: false });
                                return EMPTY;
                            })
                        );
                })
            )
    );

    // load list of filtered properties
    readonly filteredPropertiesList = this.effect(
        (resourceClass$: Observable<ApiData | undefined>) =>
            resourceClass$.pipe(
                switchMap((resClass) => {
                    this.patchState({ propertiesLoading: true });
                    if (!resClass) {
                        this.patchState({ propertiesLoading: false });
                        return EMPTY;
                    }
                    return this._advancedSearchService
                        .filteredPropertiesList(resClass.iri)
                        .pipe(
                            tap({
                                next: (response) => {
                                    this.patchState({
                                        filteredProperties: response,
                                    });
                                    this.patchState({
                                        propertiesLoading: false,
                                    });
                                },
                                error: (error) => {
                                    this.patchState({ error });
                                    this.patchState({
                                        propertiesLoading: false,
                                    });
                                },
                            }),
                            catchError(() => {
                                this.patchState({ propertiesLoading: false });
                                return EMPTY;
                            })
                        );
                })
            )
    );
}
