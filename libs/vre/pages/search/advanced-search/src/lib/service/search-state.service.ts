import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
  catchError,
  EMPTY,
  take,
} from 'rxjs';
import {
  PropertyFormItem,
  OrderByItem,
  ParentChildPropertyPair,
  SearchItem,
  SearchFormsState,
  AdvancedSearchStateSnapshot,
  ApiData,
} from '../model';
import { EMPTY_PROPERTY_FORM_ITEM, INITIAL_FORMS_STATE } from '../util';
import { AdvancedSearchApiService } from './advanced-search-api.service';
import { GravsearchService } from './gravsearch.service';
import { Operators } from './operators.config';
import { PropertyFormManager } from './property-form.manager';

@Injectable()
export class SearchStateService {
  private _advancedSearchService = inject(AdvancedSearchApiService);
  private _formManager = inject(PropertyFormManager);
  private _gravsearchService = inject(GravsearchService);

  private _state = new BehaviorSubject<SearchFormsState>(INITIAL_FORMS_STATE);

  ontologies$ = this._state.pipe(
    map(state => state.ontologies),
    distinctUntilChanged()
  );
  resourceClasses$ = this._state.pipe(
    map(state => state.resourceClasses),
    distinctUntilChanged()
  );
  selectedProject$ = this._state.pipe(
    map(state => state.selectedProject),
    distinctUntilChanged()
  );
  selectedOntology$ = this._state.pipe(
    map(state => state.selectedOntology),
    distinctUntilChanged()
  );
  selectedResourceClass$ = this._state.pipe(
    map(state => state.selectedResourceClass),
    distinctUntilChanged()
  );
  propertyForms$ = this._state.pipe(
    map(state => state.propertyFormList),
    distinctUntilChanged()
  );
  propertiesOrderByList$ = this._state.pipe(
    map(state => state.propertiesOrderByList),
    distinctUntilChanged()
  );
  propertiesLoading$ = this._state.pipe(
    map(state => state.propertiesLoading),
    distinctUntilChanged()
  );
  filteredProperties$ = this._state.pipe(
    map(state => state.filteredProperties),
    distinctUntilChanged()
  );
  matchResourceClassesLoading$ = this._state.pipe(
    map(state => state.matchResourceClassesLoading),
    distinctUntilChanged()
  );
  resourcesSearchResultsLoading$ = this._state.pipe(
    map(state => state.resourcesSearchResultsLoading),
    distinctUntilChanged()
  );
  resourcesSearchResultsCount$ = this._state.pipe(
    map(state => state.resourcesSearchResultsCount),
    distinctUntilChanged()
  );
  resourcesSearchResults$ = this._state.pipe(
    map(state => state.resourcesSearchResults),
    distinctUntilChanged()
  );
  resourcesSearchNoResults$ = this._state.pipe(
    map(state => state.resourcesSearchNoResults),
    distinctUntilChanged()
  );

  setState(state: Partial<SearchFormsState>): void {
    this._state.next({ ...this._state.value, ...state });
  }

  patchState(partialState: Partial<SearchFormsState>): void {
    this._state.next({ ...this._state.value, ...partialState });
  }

  get<T>(selector: (state: SearchFormsState) => T): T {
    return selector(this._state.value);
  }

  // All the existing methods remain the same but use the new services internally
  updateSelectedOntology(ontology: ApiData): void {
    this.patchState({ selectedOntology: ontology });
    this.patchState({ selectedResourceClass: undefined });
    this.patchState({ propertyFormList: [EMPTY_PROPERTY_FORM_ITEM] });
    this.patchState({ propertiesOrderByList: [] });
  }

  updateSelectedResourceClass(resourceClass: ApiData | undefined): void {
    this.patchState({ selectedResourceClass: resourceClass });
    this.patchState({ propertyFormList: [EMPTY_PROPERTY_FORM_ITEM] });
    this.patchState({ propertiesOrderByList: [] });
  }

  deletePropertyForm(property: PropertyFormItem): void {
    const currentPropertyFormList = this.get(state => state.propertyFormList);
    const currentOrderByList = this.get(state => state.propertiesOrderByList);

    const updatedPropertyFormList = currentPropertyFormList.filter(item => item !== property);
    const updatedOrderByList = currentOrderByList.filter(item => item.id !== property.id);

    // Ensure at least one empty property form remains
    if (updatedPropertyFormList.length === 0) {
      updatedPropertyFormList.push(EMPTY_PROPERTY_FORM_ITEM);
    }

    this.patchState({
      propertyFormList: updatedPropertyFormList,
      propertiesOrderByList: updatedOrderByList,
    });
  }

  updateSelectedProperty(property: PropertyFormItem): void {
    const currentPropertyFormList = this.get(state => state.propertyFormList);
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property);
    if (indexInPropertyFormList > -1 && property.selectedProperty) {
      const updatedForm = this._formManager.updateSelectedProperty(
        property,
        property.selectedProperty,
        list => {
          property.list = list;
          this.updatePropertyFormListItem(currentPropertyFormList, property, indexInPropertyFormList);
        },
        () => {
          // Loading start callback
        },
        error => {
          this.patchState({ error });
        }
      );

      // Check if this is the last property form and it's now being used
      const isLastPropertyForm = indexInPropertyFormList === currentPropertyFormList.length - 1;
      let updatedPropertyFormList = currentPropertyFormList;

      if (isLastPropertyForm) {
        updatedPropertyFormList = [...currentPropertyFormList, EMPTY_PROPERTY_FORM_ITEM];
      }

      this.updatePropertyFormListItem(updatedPropertyFormList, updatedForm, indexInPropertyFormList);
    }

    this.patchState({
      propertiesOrderByList: this.getPropertiesOrderByList(property),
    });
  }

  updatePropertyFormListItem(propertyFormList: PropertyFormItem[], property: PropertyFormItem, index: number): void {
    const updatedPropertyFormList = [
      ...propertyFormList.slice(0, index),
      property,
      ...propertyFormList.slice(index + 1),
    ];

    this.patchState({ propertyFormList: updatedPropertyFormList });
  }

  updatePropertyOrderBy(orderByList: OrderByItem[]): void {
    this.patchState({ propertiesOrderByList: orderByList });
  }

  // Child property form methods that were in the original service
  addChildPropertyFormList(property: PropertyFormItem): void {
    const currentPropertyFormList = this.get(state => state.propertyFormList);
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property);

    const currentSearchValue =
      (currentPropertyFormList[indexInPropertyFormList].searchValue as PropertyFormItem[]) || [];

    const childForm = EMPTY_PROPERTY_FORM_ITEM;
    childForm.isChildProperty = true;

    const updatedSearchValue = [...currentSearchValue, childForm];

    const updatedProp = currentPropertyFormList[indexInPropertyFormList];
    updatedProp.searchValue = updatedSearchValue;

    this.updatePropertyFormListItem(currentPropertyFormList, updatedProp, indexInPropertyFormList);
  }

  deleteChildPropertyFormList(property: ParentChildPropertyPair): void {
    const currentPropertyFormList = this.get(state => state.propertyFormList);
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property.parentProperty);

    const currentSearchValue =
      (currentPropertyFormList[indexInPropertyFormList].searchValue as PropertyFormItem[]) || [];
    const updatedSearchValue = currentSearchValue.filter(item => item.id !== property.childProperty.id);

    const updatedProp = currentPropertyFormList[indexInPropertyFormList];
    updatedProp.searchValue = updatedSearchValue;

    this.updatePropertyFormListItem(currentPropertyFormList, updatedProp, indexInPropertyFormList);
  }

  updateChildSelectedProperty(property: ParentChildPropertyPair): void {
    const currentPropertyFormList = this.get(state => state.propertyFormList);
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property.parentProperty);

    const currentSearchValue =
      (currentPropertyFormList[indexInPropertyFormList].searchValue as PropertyFormItem[]) || [];
    const indexInCurrentSearchValue = currentSearchValue.findIndex(item => item.id === property.childProperty.id);

    if (indexInCurrentSearchValue > -1 && property.childProperty.selectedProperty) {
      const updatedChildForm = this._formManager.updateSelectedProperty(
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
          this.updatePropertyFormListItem(currentPropertyFormList, updatedProp, indexInPropertyFormList);
        },
        () => {
          // Loading start callback
        },
        error => {
          this.patchState({ error });
        }
      );

      const updatedProp = currentPropertyFormList[indexInPropertyFormList];
      updatedProp.searchValue = [
        ...currentSearchValue.slice(0, indexInCurrentSearchValue),
        updatedChildForm,
        ...currentSearchValue.slice(indexInCurrentSearchValue + 1),
      ];

      this.updatePropertyFormListItem(currentPropertyFormList, updatedProp, indexInPropertyFormList);
    }
  }

  updateSelectedOperator(property: PropertyFormItem): void {
    const currentOntology = this.get(state => state.selectedOntology);
    const currentPropertyFormList = this.get(state => state.propertyFormList);
    const index = currentPropertyFormList.indexOf(property);

    if (index > -1) {
      const updatedForm = this._formManager.updateSelectedOperator(property, property.selectedOperator!);

      if (property.selectedOperator === Operators.Matches && property.selectedProperty?.isLinkedResourceProperty) {
        if (!currentOntology?.iri) return;

        this.patchState({ matchResourceClassesLoading: true });

        this._advancedSearchService
          .resourceClassesList(currentOntology.iri, property.selectedProperty.objectType)
          .pipe(
            take(1),
            tap(resourceClasses => {
              property.matchPropertyResourceClasses = resourceClasses;
              this.updatePropertyFormListItem(currentPropertyFormList, property, index);
              this.patchState({ matchResourceClassesLoading: false });
            }),
            catchError(error => {
              this.patchState({ error, matchResourceClassesLoading: false });
              return EMPTY;
            })
          )
          .subscribe();
      } else {
        this.updatePropertyFormListItem(currentPropertyFormList, updatedForm, index);
      }
    }
  }

  updateSelectedMatchPropertyResourceClass(property: PropertyFormItem): void {
    const currentPropertyFormList = this.get(state => state.propertyFormList);
    const index = currentPropertyFormList.indexOf(property);

    if (index > -1 && property.selectedMatchPropertyResourceClass) {
      this._advancedSearchService
        .filteredPropertiesList(property.selectedMatchPropertyResourceClass.iri)
        .pipe(
          take(1),
          tap(properties => {
            property.childPropertiesList = properties;
            property.searchValue = [];
            this.updatePropertyFormListItem(currentPropertyFormList, property, index);
          }),
          catchError(error => {
            this.patchState({ error });
            return EMPTY;
          })
        )
        .subscribe();
    }
  }

  updateChildSelectedOperator(property: ParentChildPropertyPair): void {
    const currentPropertyFormList = this.get(state => state.propertyFormList);
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property.parentProperty);

    const currentSearchValue =
      (currentPropertyFormList[indexInPropertyFormList].searchValue as PropertyFormItem[]) || [];
    const indexInCurrentSearchValue = currentSearchValue.findIndex(item => item.id === property.childProperty.id);

    if (indexInPropertyFormList > -1 && indexInCurrentSearchValue > -1) {
      const updatedChild = this._formManager.updateSelectedOperator(
        property.childProperty,
        property.childProperty.selectedOperator!
      );

      property.parentProperty.searchValue = [
        ...currentSearchValue.slice(0, indexInCurrentSearchValue),
        updatedChild,
        ...currentSearchValue.slice(indexInCurrentSearchValue + 1),
      ];

      this.updatePropertyFormListItem(currentPropertyFormList, property.parentProperty, indexInPropertyFormList);
    }
  }

  updateSearchValue(property: PropertyFormItem): void {
    const currentPropertyFormList = this.get(state => state.propertyFormList);
    const index = currentPropertyFormList.indexOf(property);

    if (index > -1) {
      this.updatePropertyFormListItem(currentPropertyFormList, property, index);
    }
  }

  updateChildSearchValue(property: ParentChildPropertyPair): void {
    const currentPropertyFormList = this.get(state => state.propertyFormList);
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

      this.updatePropertyFormListItem(currentPropertyFormList, property.parentProperty, indexInPropertyFormList);
    }
  }

  updateResourcesSearchResults(searchItem: SearchItem): void {
    this.patchState({
      resourcesSearchResultsLoading: true,
      resourcesSearchResults: [],
      resourcesSearchResultsPageNumber: 0,
    });

    this._advancedSearchService
      .getResourcesListCount(searchItem.value, searchItem.objectType)
      .pipe(
        take(1),
        switchMap(count => {
          this.patchState({ resourcesSearchResultsCount: count });

          if (count > 0) {
            return this._advancedSearchService.getResourcesList(searchItem.value, searchItem.objectType, 0).pipe(
              take(1),
              tap(resources => {
                this.patchState({
                  resourcesSearchResults: resources,
                  resourcesSearchResultsLoading: false,
                  resourcesSearchNoResults: resources.length === 0 && searchItem.value?.length >= 3,
                });
              })
            );
          } else {
            this.patchState({
              resourcesSearchNoResults: true,
              resourcesSearchResultsLoading: false,
            });
            return EMPTY;
          }
        }),
        catchError(error => {
          this.patchState({ error, resourcesSearchResultsLoading: false });
          return EMPTY;
        })
      )
      .subscribe();
  }

  loadMoreResourcesSearchResults(searchItem: SearchItem): void {
    const count = this.get(state => state.resourcesSearchResultsCount);
    const results = this.get(state => state.resourcesSearchResults);

    if (count > results.length) {
      const nextPageNumber = this.get(state => state.resourcesSearchResultsPageNumber) + 1;
      this.patchState({ resourcesSearchResultsLoading: true });

      this._advancedSearchService
        .getResourcesList(searchItem.value, searchItem.objectType, nextPageNumber)
        .pipe(
          take(1),
          tap(resources => {
            this.patchState({
              resourcesSearchResultsPageNumber: nextPageNumber,
              resourcesSearchResults: results.concat(resources),
              resourcesSearchResultsLoading: false,
            });
          }),
          catchError(error => {
            this.patchState({ error, resourcesSearchResultsLoading: false });
            return EMPTY;
          })
        )
        .subscribe();
    }
  }

  onSearch(): string {
    const ontoIri = this.get(state => state.selectedOntology)!.iri;
    const selectedResourceClass = this.get(state => state.selectedResourceClass);
    const propertyFormList = this.get(state => state.propertyFormList);
    const orderByList = this.get(state => state.propertiesOrderByList);
    const resourceClasses = this.get(state => state.resourceClasses).map(resClass => resClass.iri);

    const nonEmptyPropertyFormList = propertyFormList.filter(prop => prop.selectedProperty);

    this._storeSnapshotInLocalStorage();

    return this._gravsearchService.generateGravSearchQuery(
      ontoIri,
      resourceClasses,
      selectedResourceClass?.iri,
      nonEmptyPropertyFormList,
      orderByList
    );
  }

  reset() {
    this.patchState({ selectedOntology: this.get(state => state.ontologies[0]) });
    this.patchState({ selectedResourceClass: undefined });
    this.patchState({ propertyFormList: [EMPTY_PROPERTY_FORM_ITEM] });
    this.patchState({ propertiesOrderByList: [] });
  }

  // Simplified API call methods using the new API service
  ontologiesList(ontologyIri$: Observable<string | undefined>): void {
    ontologyIri$
      .pipe(
        switchMap(iri => {
          if (!iri) {
            return EMPTY;
          }
          this.patchState({ ontologiesLoading: true });
          return this._advancedSearchService.ontologiesInProjectList(iri).pipe(
            take(1),
            tap(data => {
              this.patchState({
                ontologies: data,
                ontologiesLoading: false,
                selectedOntology: data[0],
              });
            }),
            catchError(error => {
              this.patchState({ error, ontologiesLoading: false });
              return EMPTY;
            })
          );
        })
      )
      .subscribe();
  }

  resourceClassesList(resourceClass$: Observable<ApiData | undefined>): void {
    resourceClass$
      .pipe(
        switchMap(resClass => {
          if (!resClass) {
            this.patchState({ resourceClassesLoading: false });
            return EMPTY;
          }
          this.patchState({ resourceClassesLoading: true });
          return this._advancedSearchService.resourceClassesList(resClass.iri).pipe(
            take(1),
            tap(data => this.patchState({ resourceClasses: data, resourceClassesLoading: false })),
            catchError(error => {
              this.patchState({ error, resourceClassesLoading: false });
              return EMPTY;
            })
          );
        })
      )
      .subscribe();
  }

  propertiesList(ontology$: Observable<ApiData | undefined>): void {
    ontology$
      .pipe(
        switchMap(onto => {
          if (!onto) {
            this.patchState({ propertiesLoading: false });
            return EMPTY;
          }
          this.patchState({ propertiesLoading: true });
          return this._advancedSearchService.propertiesList(onto.iri).pipe(
            take(1),
            tap(data => this.patchState({ properties: data, propertiesLoading: false })),
            catchError(error => {
              this.patchState({ error, propertiesLoading: false });
              return EMPTY;
            })
          );
        })
      )
      .subscribe();
  }

  filteredPropertiesList(): void {
    combineLatest([this.selectedOntology$, this.selectedResourceClass$])
      .pipe(
        switchMap(([ontology, resourceClass]) => {
          if (!ontology) {
            this.patchState({ filteredProperties: [], propertiesLoading: false });
            return EMPTY;
          }

          this.patchState({ propertiesLoading: true });

          if (!resourceClass) {
            return this._advancedSearchService.propertiesList(ontology.iri).pipe(
              take(1),
              tap(data => this.patchState({ filteredProperties: data, properties: data, propertiesLoading: false })),
              catchError(error => {
                this.patchState({ error, propertiesLoading: false });
                return EMPTY;
              })
            );
          }

          return this._advancedSearchService.filteredPropertiesList(resourceClass.iri).pipe(
            take(1),
            tap(data => this.patchState({ filteredProperties: data, propertiesLoading: false })),
            catchError(error => {
              this.patchState({ error, propertiesLoading: false });
              return EMPTY;
            })
          );
        })
      )
      .subscribe();
  }

  private _storeSnapshotInLocalStorage(): void {
    const state = this._state.value;
    const snapshot: AdvancedSearchStateSnapshot = {
      ontologies: state.ontologies,
      resourceClasses: state.resourceClasses,
      selectedProject: state.selectedProject,
      selectedOntology: state.selectedOntology,
      selectedResourceClass: state.selectedResourceClass,
      propertyFormList: state.propertyFormList,
      properties: state.properties,
      propertiesOrderByList: state.propertiesOrderByList,
      filteredProperties: state.filteredProperties,
    };

    const searchStored = localStorage.getItem('advanced-search-previous-search');
    const projectPreviousSearch: Record<string, typeof snapshot> = searchStored ? JSON.parse(searchStored) : {};
    if (snapshot.selectedProject) {
      projectPreviousSearch[snapshot.selectedProject] = snapshot;
    }

    localStorage.setItem('advanced-search-previous-search', JSON.stringify(projectPreviousSearch));
  }

  private getPropertiesOrderByList(property: PropertyFormItem): OrderByItem[] {
    const currentOrderByList = this.get(state => state.propertiesOrderByList);
    return this._formManager.updateOrderByList(currentOrderByList, property);
  }
}
