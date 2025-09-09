import { Injectable, inject, OnDestroy } from '@angular/core';
import {
  tap,
  catchError,
  EMPTY,
  take,
  map,
  distinctUntilChanged,
  switchMap,
  Observable,
  takeUntil,
  combineLatest,
  Subject,
} from 'rxjs';
import {
  PropertyFormItem,
  PropertyData,
  OrderByItem,
  SearchFormsState,
  ApiData,
  ParentChildPropertyPair,
  SearchItem,
} from '../model';
import {
  updateOrderByList,
  EMPTY_CHILD_PROPERTY_FORM_ITEM,
  EMPTY_PROPERTY_FORM_ITEM,
  INITIAL_FORMS_STATE,
} from '../util';
import { AdvancedSearchApiService } from './advanced-search-api.service';
import { Operators, getOperatorsForObjectType } from './operators.config';
import { SearchStateService } from './search-state.service';

@Injectable()
export class PropertyFormManager implements OnDestroy {
  private apiService = inject(AdvancedSearchApiService);
  private searchStateService = inject(SearchStateService);

  private _destroy$ = new Subject<void>();

  constructor() {
    this.searchStateService.selectedOntology$
      .pipe(
        takeUntil(this._destroy$),
        distinctUntilChanged(),
        switchMap(ontology => {
          if (!ontology) {
            return EMPTY;
          }

          return combineLatest([
            this.apiService.resourceClassesList(ontology.iri),
            this.apiService.propertiesList(ontology.iri),
          ]).pipe(
            take(1),
            tap(([resourceClasses, properties]) => {
              this.searchStateService.patchState({
                resourceClasses: resourceClasses || [],
                resourceClassesLoading: false,
                properties: properties || [],
                filteredProperties: properties || [],
                propertiesLoading: false,
              });
            })
          );
        })
      )
      .subscribe();

    this.searchStateService.selectedResourceClass$
      .pipe(
        takeUntil(this._destroy$),
        distinctUntilChanged((prev, curr) => prev?.iri === curr?.iri),
        switchMap(resourceClass => {
          console.log('Selected Resource Class changed:', resourceClass);
          const ontology = this.searchStateService.currentState.selectedOntology;
          if (!ontology) {
            return EMPTY;
          }

          if (!resourceClass || resourceClass.iri === 'all-resource-classes') {
            return this.apiService.propertiesList(ontology.iri).pipe(
              take(1),
              tap(properties => {
                this.searchStateService.patchState({
                  filteredProperties: properties || [],
                  propertiesLoading: false,
                });
              })
            );
          }

          return this.apiService.filteredPropertiesList(resourceClass.iri).pipe(
            take(1),
            tap(properties => {
              this.searchStateService.patchState({
                filteredProperties: properties || [],
                propertiesLoading: false,
              });
            })
          );
        })
      )
      .subscribe();

    // Automatically update propertiesOrderBy when propertyFormList changes
    this.searchStateService.propertyForms$
      .pipe(
        takeUntil(this._destroy$),
        distinctUntilChanged(),
        map(propertyFormList => {
          const validOrderByItems = this.searchStateService.currentState.propertiesOrderBy.filter(orderByItem =>
            propertyFormList.some(form => form.id === orderByItem.id)
          );

          const newOrderByItems = propertyFormList
            .filter(
              form => form.selectedProperty && !validOrderByItems.some(item => item.id === form.selectedProperty?.iri)
            )
            .map(form => ({
              id: form.selectedProperty?.iri,
              label: form.selectedProperty!.label,
              orderBy: false,
              disabled: false,
            }));

          return [...validOrderByItems, ...newOrderByItems];
        }),
        tap(updatedOrderByList => {
          // Only update if the order by list actually changed
          const currentOrderByList = this.searchStateService.currentState.propertiesOrderBy;
          console.log('Updated Order By List:', currentOrderByList, updatedOrderByList);
          if (JSON.stringify(currentOrderByList) !== JSON.stringify(updatedOrderByList)) {
            this.searchStateService.patchState({ propertiesOrderBy: updatedOrderByList });
          }
        })
      )
      .subscribe();
  }

  init(projectIri: string): void {
    this.searchStateService.patchState({
      ...INITIAL_FORMS_STATE,
      selectedProject: projectIri,
    });

    this.apiService
      .ontologiesInProjectList(projectIri)
      .pipe(take(1))
      .subscribe(ontologies => {
        if (!ontologies?.length) {
          return;
        }
        this.searchStateService.patchState({
          ontologies,
          ontologiesLoading: false,
          selectedOntology: ontologies[0],
        });
      });
  }

  updateResourcesSearchResults(searchItem: SearchItem): void {
    this.searchStateService.patchState({
      resourcesSearchResultsLoading: true,
      resourcesSearchResults: [],
      resourcesSearchResultsPageNumber: 0,
    });

    this.apiService
      .getResourcesListCount(searchItem.value, searchItem.objectType)
      .pipe(
        take(1),
        switchMap(count => {
          this.searchStateService.patchState({ resourcesSearchResultsCount: count });

          if (count > 0) {
            return this.apiService.getResourcesList(searchItem.value, searchItem.objectType, 0).pipe(
              take(1),
              tap(resources => {
                this.searchStateService.patchState({
                  resourcesSearchResults: resources,
                  resourcesSearchResultsLoading: false,
                  resourcesSearchNoResults: resources.length === 0 && searchItem.value?.length >= 3,
                });
              })
            );
          } else {
            this.searchStateService.patchState({
              resourcesSearchNoResults: true,
              resourcesSearchResultsLoading: false,
            });
            return EMPTY;
          }
        }),
        catchError(error => {
          this.searchStateService.patchState({ error, resourcesSearchResultsLoading: false });
          return EMPTY;
        })
      )
      .subscribe();
  }

  loadMoreResourcesSearchResults(searchItem: SearchItem): void {
    const count = this.searchStateService.currentState.resourcesSearchResultsCount;
    const results = this.searchStateService.currentState.resourcesSearchResults;

    if (count > results.length) {
      const nextPageNumber = this.searchStateService.currentState.resourcesSearchResultsPageNumber + 1;
      this.searchStateService.patchState({ resourcesSearchResultsLoading: true });

      this.apiService
        .getResourcesList(searchItem.value, searchItem.objectType, nextPageNumber)
        .pipe(
          take(1),
          tap(resources => {
            this.searchStateService.patchState({
              resourcesSearchResultsPageNumber: nextPageNumber,
              resourcesSearchResults: results.concat(resources),
              resourcesSearchResultsLoading: false,
            });
          }),
          catchError(error => {
            this.searchStateService.patchState({ error, resourcesSearchResultsLoading: false });
            return EMPTY;
          })
        )
        .subscribe();
    }
  }

  updateSelectedProperty(
    form: PropertyFormItem,
    property: PropertyData,
    onListLoaded?: (list: any) => void,
    onLoadingStart?: () => void,
    onError?: (error: unknown) => void
  ): PropertyFormItem {
    const updatedForm = { ...form };
    updatedForm.selectedProperty = property;

    // Reset dependent fields
    updatedForm.selectedOperator = undefined;
    updatedForm.searchValue = undefined;

    updatedForm.operators = [...getOperatorsForObjectType(property.objectType)];

    // Load list if property has a listIri
    if (property.listIri && onListLoaded && onLoadingStart && onError) {
      onLoadingStart();
      this.apiService
        .getList(property.listIri)
        .pipe(
          take(1),
          tap(list => {
            if (list) {
              updatedForm.list = list;
              onListLoaded(list);
            }
          }),
          catchError(error => {
            onError(error);
            return EMPTY;
          })
        )
        .subscribe();
    }

    return updatedForm;
  }

  updateSelectedOperator(form: PropertyFormItem, operator: string): PropertyFormItem {
    const updatedForm = { ...form };
    updatedForm.selectedOperator = operator;

    // Reset search value if operator is 'exists' or 'does not exist'
    if (operator === Operators.Exists || operator === Operators.NotExists) {
      updatedForm.searchValue = undefined;
    }

    return updatedForm;
  }

  updateSearchValue(form: PropertyFormItem, searchValue: string | PropertyFormItem[] | undefined): PropertyFormItem {
    return {
      ...form,
      searchValue,
    };
  }

  /**
   * Adds a child property form to a parent form's search value
   */
  addChildPropertyForm(parentForm: PropertyFormItem): PropertyFormItem {
    const currentSearchValue = (parentForm.searchValue as PropertyFormItem[]) || [];

    return {
      ...parentForm,
      searchValue: [...currentSearchValue, EMPTY_CHILD_PROPERTY_FORM_ITEM],
    };
  }

  /**
   * Removes a child property form from a parent form's search value
   */
  removeChildPropertyForm(parentForm: PropertyFormItem, childFormId: string): PropertyFormItem {
    const currentSearchValue = (parentForm.searchValue as PropertyFormItem[]) || [];
    const updatedSearchValue = currentSearchValue.filter(item => item.id !== childFormId);

    return {
      ...parentForm,
      searchValue: updatedSearchValue,
    };
  }

  /**
   * Updates a specific child property form within a parent form
   */
  updateChildPropertyForm(
    parentForm: PropertyFormItem,
    childFormId: string,
    updatedChild: PropertyFormItem
  ): PropertyFormItem {
    const currentSearchValue = (parentForm.searchValue as PropertyFormItem[]) || [];
    const childIndex = currentSearchValue.findIndex(item => item.id === childFormId);

    if (childIndex === -1) {
      return parentForm;
    }

    const updatedSearchValue = [
      ...currentSearchValue.slice(0, childIndex),
      updatedChild,
      ...currentSearchValue.slice(childIndex + 1),
    ];

    return {
      ...parentForm,
      searchValue: updatedSearchValue,
    };
  }

  updateOrderByList(currentOrderBy: OrderByItem[], form: PropertyFormItem): OrderByItem[] {
    return updateOrderByList(currentOrderBy, form);
  }

  updateOrderByListFromFormList(currentOrderBy: OrderByItem[], propertyFormList: PropertyFormItem[]): OrderByItem[] {
    // Filter out order by items that no longer have corresponding properties
    console.log('Current Order By:', currentOrderBy);
    const validOrderByItems = currentOrderBy.filter(orderByItem =>
      propertyFormList.some(form => form.id === orderByItem.id)
    );
    console.log('Valid Order By Items:', validOrderByItems);

    const newOrderByItems = propertyFormList
      .filter(form => form.selectedProperty && !validOrderByItems.some(item => item.id === form.id))
      .map(form => ({
        id: form.id,
        label: form.selectedProperty!.label,
        orderBy: false,
        disabled: false,
      }));

    return [...validOrderByItems, ...newOrderByItems];
  }

  // ========== NEW STATE UPDATE METHODS ==========

  /**
   * Updates the selected ontology and resets dependent state
   */
  updateSelectedOntology(ontology: ApiData): void {
    this.searchStateService.patchState({
      selectedOntology: ontology,
      selectedResourceClass: undefined,
      propertyFormList: [EMPTY_PROPERTY_FORM_ITEM],
      propertiesOrderBy: [],
    });
  }

  /**
   * Updates the selected resource class and resets dependent state
   */
  updateSelectedResourceClass(resourceClass: ApiData): void {
    this.searchStateService.patchState({
      selectedResourceClass: resourceClass,
      propertyFormList: [EMPTY_PROPERTY_FORM_ITEM],
      propertiesOrderBy: [],
    });
  }

  /**
   * Deletes a property form and updates order by list
   */
  deletePropertyForm(property: PropertyFormItem): void {
    const currentState = this.searchStateService.currentState;
    const updatedPropertyFormList = currentState.propertyFormList.filter(item => item !== property);
    const updatedOrderByList = currentState.propertiesOrderBy.filter(item => item.id !== property.id);

    this.searchStateService.patchState({
      propertyFormList: updatedPropertyFormList,
      propertiesOrderBy: updatedOrderByList,
    });
  }

  /**
   * Updates a property form and manages the form list
   */
  updatePropertyFormItem(
    currentState: SearchFormsState,
    property: PropertyFormItem,
    onListLoaded?: (property: PropertyFormItem) => void,
    onError?: (error: unknown) => void
  ): Partial<SearchFormsState> | Observable<Partial<SearchFormsState>> {
    const currentPropertyFormList = currentState.propertyFormList;
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property);

    if (indexInPropertyFormList === -1 || !property.selectedProperty) {
      return {};
    }

    const updatedForm = this.updateSelectedProperty(
      property,
      property.selectedProperty,
      list => {
        if (onListLoaded) {
          property.list = list;
          onListLoaded(property);
        }
      },
      () => {
        // Loading start callback - components can handle loading state
      },
      error => {
        if (onError) {
          onError(error);
        }
      }
    );

    // Check if this is the last property form and it's now being used
    const isLastPropertyForm = indexInPropertyFormList === currentPropertyFormList.length - 1;
    let updatedPropertyFormList = currentPropertyFormList;

    if (isLastPropertyForm) {
      updatedPropertyFormList = [...currentPropertyFormList, EMPTY_PROPERTY_FORM_ITEM];
    }

    const finalPropertyFormList = this.updatePropertyFormListItem(
      updatedPropertyFormList,
      updatedForm,
      indexInPropertyFormList
    );

    return {
      propertyFormList: finalPropertyFormList,
    };
  }

  private updatePropertyFormListItem(
    propertyFormList: PropertyFormItem[],
    property: PropertyFormItem,
    index: number
  ): PropertyFormItem[] {
    return [...propertyFormList.slice(0, index), property, ...propertyFormList.slice(index + 1)];
  }

  // Child property form methods that were in the original service
  addChildPropertyFormList(property: PropertyFormItem): void {
    const currentPropertyFormList = this.searchStateService.currentState.propertyFormList;
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property);

    const currentSearchValue =
      (currentPropertyFormList[indexInPropertyFormList].searchValue as PropertyFormItem[]) || [];

    const childForm = EMPTY_PROPERTY_FORM_ITEM;
    childForm.isChildProperty = true;

    const updatedSearchValue = [...currentSearchValue, childForm];

    const updatedProp = currentPropertyFormList[indexInPropertyFormList];
    updatedProp.searchValue = updatedSearchValue;

    this.searchStateService.updatePropertyListItem(currentPropertyFormList, updatedProp, indexInPropertyFormList);
  }

  /**
   * Deletes a child property form
   */
  deleteChildPropertyFormList(
    currentState: SearchFormsState,
    property: ParentChildPropertyPair
  ): Partial<SearchFormsState> {
    const currentPropertyFormList = currentState.propertyFormList;
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property.parentProperty);

    if (indexInPropertyFormList === -1) {
      return {};
    }

    const currentSearchValue =
      (currentPropertyFormList[indexInPropertyFormList].searchValue as PropertyFormItem[]) || [];
    const updatedSearchValue = currentSearchValue.filter(item => item.id !== property.childProperty.id);

    const updatedProp = { ...currentPropertyFormList[indexInPropertyFormList] };
    updatedProp.searchValue = updatedSearchValue;

    const updatedPropertyFormList = this.updatePropertyFormListItem(
      currentPropertyFormList,
      updatedProp,
      indexInPropertyFormList
    );

    return {
      propertyFormList: updatedPropertyFormList,
    };
  }

  updateChildSelectedProperty(property: ParentChildPropertyPair): void {
    const currentPropertyFormList = this.searchStateService.currentState.propertyFormList;
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property.parentProperty);

    const currentSearchValue =
      (currentPropertyFormList[indexInPropertyFormList].searchValue as PropertyFormItem[]) || [];
    const indexInCurrentSearchValue = currentSearchValue.findIndex(item => item.id === property.childProperty.id);

    if (indexInCurrentSearchValue > -1 && property.childProperty.selectedProperty) {
      const updatedChildForm = this.updateSelectedProperty(
        property.childProperty,
        property.childProperty.selectedProperty,
        list => {
          property.childProperty.list = list;
          const updatedProp = currentPropertyFormList[indexInPropertyFormList];
          updatedProp.searchValue = [
            ...currentSearchValue.slice(0, indexInCurrentSearchValue),
            property.childProperty,
            ...currentSearchValue.slice(indexInCurrentSearchValue + 1),
          ];
          this.searchStateService.updatePropertyListItem(currentPropertyFormList, updatedProp, indexInPropertyFormList);
        },
        () => {
          // Loading start callback
        },
        error => {
          this.searchStateService.patchState({ error });
        }
      );

      const updatedProp = currentPropertyFormList[indexInPropertyFormList];
      updatedProp.searchValue = [
        ...currentSearchValue.slice(0, indexInCurrentSearchValue),
        updatedChildForm,
        ...currentSearchValue.slice(indexInCurrentSearchValue + 1),
      ];

      this.searchStateService.updatePropertyListItem(currentPropertyFormList, updatedProp, indexInPropertyFormList);
    }
  }

  /**
   * Updates a property's selected operator
   */
  updateSelectedOperatorForProperty(
    currentState: SearchFormsState,
    property: PropertyFormItem
  ): Observable<Partial<SearchFormsState>> {
    const currentPropertyFormList = currentState.propertyFormList;
    const index = currentPropertyFormList.indexOf(property);

    if (index === -1 || !property.selectedOperator) {
      return EMPTY;
    }

    const updatedForm = this.updateSelectedOperator(property, property.selectedOperator);

    if (property.selectedOperator === Operators.Matches && property.selectedProperty?.isLinkedResourceProperty) {
      const currentOntology = currentState.selectedOntology;
      if (!currentOntology?.iri) {
        return EMPTY;
      }

      return this.apiService.resourceClassesList(currentOntology.iri, property.selectedProperty.objectType).pipe(
        take(1),
        map(resourceClasses => {
          updatedForm.matchPropertyResourceClasses = resourceClasses;
          const updatedPropertyFormList = this.updatePropertyFormListItem(currentPropertyFormList, updatedForm, index);
          return { propertyFormList: updatedPropertyFormList };
        }),
        catchError(error => {
          console.error('Error loading resource classes:', error);
          return EMPTY;
        })
      );
    } else {
      const updatedPropertyFormList = this.updatePropertyFormListItem(currentPropertyFormList, updatedForm, index);
      return new Observable(observer => {
        observer.next({ propertyFormList: updatedPropertyFormList });
        observer.complete();
      });
    }
  }

  /**
   * Updates a selected match property resource class
   */
  updateSelectedMatchPropertyResourceClass(
    currentState: SearchFormsState,
    property: PropertyFormItem
  ): Observable<Partial<SearchFormsState>> {
    const currentPropertyFormList = currentState.propertyFormList;
    const index = currentPropertyFormList.indexOf(property);

    if (index === -1 || !property.selectedMatchPropertyResourceClass) {
      return EMPTY;
    }

    return this.apiService.filteredPropertiesList(property.selectedMatchPropertyResourceClass.iri).pipe(
      take(1),
      map(properties => {
        const updatedProperty = { ...property };
        updatedProperty.childPropertiesList = properties;
        updatedProperty.searchValue = [];

        const updatedPropertyFormList = this.updatePropertyFormListItem(
          currentPropertyFormList,
          updatedProperty,
          index
        );
        return { propertyFormList: updatedPropertyFormList };
      }),
      catchError(error => {
        console.error('Error loading filtered properties:', error);
        return EMPTY;
      })
    );
  }

  updateChildSelectedOperator(property: ParentChildPropertyPair): void {
    const currentPropertyFormList = this.searchStateService.currentState.propertyFormList;
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property.parentProperty);

    const currentSearchValue =
      (currentPropertyFormList[indexInPropertyFormList].searchValue as PropertyFormItem[]) || [];
    const indexInCurrentSearchValue = currentSearchValue.findIndex(item => item.id === property.childProperty.id);

    if (indexInPropertyFormList > -1 && indexInCurrentSearchValue > -1) {
      const updatedChild = this.updateSelectedOperator(
        property.childProperty,
        property.childProperty.selectedOperator!
      );

      property.parentProperty.searchValue = [
        ...currentSearchValue.slice(0, indexInCurrentSearchValue),
        updatedChild,
        ...currentSearchValue.slice(indexInCurrentSearchValue + 1),
      ];

      this.searchStateService.updatePropertyListItem(
        currentPropertyFormList,
        property.parentProperty,
        indexInPropertyFormList
      );
    }
  }

  /**
   * Updates a property's search value
   */
  updateSearchValueForProperty(currentState: SearchFormsState, property: PropertyFormItem): Partial<SearchFormsState> {
    const currentPropertyFormList = currentState.propertyFormList;
    const index = currentPropertyFormList.indexOf(property);

    if (index === -1) {
      return {};
    }

    const updatedPropertyFormList = this.updatePropertyFormListItem(currentPropertyFormList, property, index);

    return {
      propertyFormList: updatedPropertyFormList,
    };
  }

  updateChildSearchValue(property: ParentChildPropertyPair): void {
    const currentPropertyFormList = this.searchStateService.currentState.propertyFormList;
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property.parentProperty);

    const currentSearchValue =
      (currentPropertyFormList[indexInPropertyFormList].searchValue as PropertyFormItem[]) || [];
    const indexInCurrentSearchValue = currentSearchValue.findIndex(item => item.id === property.childProperty.id);

    if (indexInPropertyFormList > -1 && indexInCurrentSearchValue > -1) {
      property.parentProperty.searchValue = [
        ...currentSearchValue.slice(0, indexInCurrentSearchValue),
        property.childProperty,
        ...currentSearchValue.slice(indexInCurrentSearchValue + 1),
      ];

      this.searchStateService.updatePropertyListItem(
        currentPropertyFormList,
        property.parentProperty,
        indexInPropertyFormList
      );
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
