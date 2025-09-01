import { Injectable, inject, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
  catchError,
  EMPTY,
  take,
  takeUntil,
  Subject,
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
import { OPERATORS } from './operators.config';
import { PropertyFormManager } from './property-form.manager';

@Injectable()
export class SearchStateService implements OnDestroy {
  private _advApiService = inject(AdvancedSearchApiService);
  private _formManager = inject(PropertyFormManager);
  private _gravsearchService = inject(GravsearchService);

  private _state = new BehaviorSubject<SearchFormsState>(INITIAL_FORMS_STATE);

  private _destroy$ = new Subject<void>();

  ontologies$ = this._state.pipe(
    map(state => state.ontologies),
    distinctUntilChanged()
  );
  resourceClasses$ = this._state.pipe(
    map(state => state.resourceClasses),
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
  propertiesOrderBy$ = this._state.pipe(
    map(state => state.propertiesOrderBy),
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

  isFormValid$ = this.propertyForms$.pipe(
    map(propertyFormList => {
      const hasInvalidPropertyForms = propertyFormList.some(prop => !this.isPropertyFormItemValid(prop));
      return !hasInvalidPropertyForms && propertyFormList.some(prop => prop.selectedProperty);
    }),
    distinctUntilChanged()
  );

  constructor() {
    this.selectedOntology$
      .pipe(
        takeUntil(this._destroy$),
        distinctUntilChanged(),
        switchMap(ontology => {
          if (!ontology) {
            return EMPTY;
          }

          return combineLatest([
            this._advApiService.resourceClassesList(ontology.iri),
            this._advApiService.propertiesList(ontology.iri),
          ]).pipe(
            take(1),
            tap(([resourceClasses, properties]) => {
              this.patchState({
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

    this.selectedResourceClass$
      .pipe(
        takeUntil(this._destroy$),
        distinctUntilChanged(),
        switchMap(resourceClass => {
          const ontology = this._state.value.selectedOntology;
          if (!ontology) {
            return EMPTY;
          }

          if (!resourceClass) {
            return this._advApiService.propertiesList(ontology.iri).pipe(
              take(1),
              tap(properties => {
                this.patchState({
                  filteredProperties: properties || [],
                  propertiesLoading: false,
                });
              })
            );
          }

          return this._advApiService.filteredPropertiesList(resourceClass.iri).pipe(
            take(1),
            tap(properties => {
              this.patchState({
                filteredProperties: properties || [],
                propertiesLoading: false,
              });
            })
          );
        })
      )
      .subscribe();

    // Automatically update propertiesOrderBy when propertyFormList changes
    this.propertyForms$
      .pipe(
        takeUntil(this._destroy$),
        distinctUntilChanged(),
        map(propertyFormList => {
          const validOrderByItems = this._state.value.propertiesOrderBy.filter(orderByItem =>
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
          const currentOrderByList = this._state.value.propertiesOrderBy;
          console.log('Updated Order By List:', currentOrderByList, updatedOrderByList);
          if (JSON.stringify(currentOrderByList) !== JSON.stringify(updatedOrderByList)) {
            this.patchState({ propertiesOrderBy: updatedOrderByList });
          }
        })
      )
      .subscribe();
  }

  initWithProject(projectIri: string): void {
    this.patchState({
      ...INITIAL_FORMS_STATE,
      selectedProject: projectIri,
    });

    this._advApiService
      .ontologiesInProjectList(projectIri)
      .pipe(take(1))
      .subscribe(ontologies => {
        if (!ontologies?.length) {
          return;
        }
        this.patchState({
          ontologies,
          ontologiesLoading: false,
          selectedOntology: ontologies[0],
        });
      });
  }

  setState(state: Partial<SearchFormsState>): void {
    this._state.next({ ...this._state.value, ...state });
  }

  patchState(partialState: Partial<SearchFormsState>): void {
    this._state.next({ ...this._state.value, ...partialState });
  }

  get<T>(selector: (state: SearchFormsState) => T): T {
    return selector(this._state.value);
  }

  updateSelectedOntology(ontology: ApiData): void {
    this.patchState({
      selectedOntology: ontology,
      selectedResourceClass: undefined,
      propertyFormList: [EMPTY_PROPERTY_FORM_ITEM],
      propertiesOrderBy: [],
    });
  }

  updateSelectedResourceClass(resourceClass: ApiData): void {
    this.patchState({
      selectedResourceClass: resourceClass,
      propertyFormList: [EMPTY_PROPERTY_FORM_ITEM],
      propertiesOrderBy: [],
    });
  }

  deletePropertyForm(property: PropertyFormItem): void {
    const currentPropertyFormList = this._state.value.propertyFormList;
    const currentOrderByList = this._state.value.propertiesOrderBy;

    const updatedPropertyFormList = currentPropertyFormList.filter(item => item !== property);
    const updatedOrderByList = currentOrderByList.filter(item => item.id !== property.id);

    // Ensure at least one empty property form remains
    if (updatedPropertyFormList.length === 0) {
      updatedPropertyFormList.push(EMPTY_PROPERTY_FORM_ITEM);
    }

    this.patchState({
      propertyFormList: updatedPropertyFormList,
      propertiesOrderBy: updatedOrderByList,
    });
  }

  updateSelectedProperty(property: PropertyFormItem): void {
    const currentPropertyFormList = this._state.value.propertyFormList;
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

    // propertiesOrderBy will be updated automatically by the reactive subscription
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
    this.patchState({ propertiesOrderBy: orderByList });
  }

  // Child property form methods that were in the original service
  addChildPropertyFormList(property: PropertyFormItem): void {
    const currentPropertyFormList = this._state.value.propertyFormList;
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
    const currentPropertyFormList = this._state.value.propertyFormList;
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property.parentProperty);

    const currentSearchValue =
      (currentPropertyFormList[indexInPropertyFormList].searchValue as PropertyFormItem[]) || [];
    const updatedSearchValue = currentSearchValue.filter(item => item.id !== property.childProperty.id);

    const updatedProp = currentPropertyFormList[indexInPropertyFormList];
    updatedProp.searchValue = updatedSearchValue;

    this.updatePropertyFormListItem(currentPropertyFormList, updatedProp, indexInPropertyFormList);
  }

  updateChildSelectedProperty(property: ParentChildPropertyPair): void {
    const currentPropertyFormList = this._state.value.propertyFormList;
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
    const currentOntology = this._state.value.selectedOntology;
    const currentPropertyFormList = this._state.value.propertyFormList;
    const index = currentPropertyFormList.indexOf(property);

    if (index > -1) {
      const updatedForm = this._formManager.updateSelectedOperator(property, property.selectedOperator!);

      if (property.selectedOperator === OPERATORS.Matches && property.selectedProperty?.isLinkedResourceProperty) {
        if (!currentOntology?.iri) return;

        this.patchState({ matchResourceClassesLoading: true });

        this._advApiService
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
    const currentPropertyFormList = this._state.value.propertyFormList;
    const index = currentPropertyFormList.indexOf(property);

    if (index > -1 && property.selectedMatchPropertyResourceClass) {
      this._advApiService
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
    const currentPropertyFormList = this._state.value.propertyFormList;
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
    const currentPropertyFormList = this._state.value.propertyFormList;
    const index = currentPropertyFormList.indexOf(property);

    if (index > -1) {
      this.updatePropertyFormListItem(currentPropertyFormList, property, index);
    }
  }

  updateChildSearchValue(property: ParentChildPropertyPair): void {
    const currentPropertyFormList = this._state.value.propertyFormList;
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

    this._advApiService
      .getResourcesListCount(searchItem.value, searchItem.objectType)
      .pipe(
        take(1),
        switchMap(count => {
          this.patchState({ resourcesSearchResultsCount: count });

          if (count > 0) {
            return this._advApiService.getResourcesList(searchItem.value, searchItem.objectType, 0).pipe(
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
    const count = this._state.value.resourcesSearchResultsCount;
    const results = this._state.value.resourcesSearchResults;

    if (count > results.length) {
      const nextPageNumber = this._state.value.resourcesSearchResultsPageNumber + 1;
      this.patchState({ resourcesSearchResultsLoading: true });

      this._advApiService
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
    const ontoIri = this._state.value.selectedOntology?.iri;
    const selectedResourceClass = this._state.value.selectedResourceClass;
    const propertyFormList = this._state.value.propertyFormList;
    const orderByList = this._state.value.propertiesOrderBy;
    const resourceClasses = this._state.value.resourceClasses.map(resClass => resClass.iri);

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
    this.patchState({ selectedOntology: this._state.value.ontologies[0] });
    this.patchState({ selectedResourceClass: undefined });
    this.patchState({ propertyFormList: [EMPTY_PROPERTY_FORM_ITEM] });
    this.patchState({ propertiesOrderBy: [] });
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
      propertiesOrderBy: state.propertiesOrderBy,
      filteredProperties: state.filteredProperties,
    };

    const searchStored = localStorage.getItem('advanced-search-previous-search');
    const projectPreviousSearch: Record<string, typeof snapshot> = searchStored ? JSON.parse(searchStored) : {};
    if (snapshot.selectedProject) {
      projectPreviousSearch[snapshot.selectedProject] = snapshot;
    }

    localStorage.setItem('advanced-search-previous-search', JSON.stringify(projectPreviousSearch));
  }

  isPropertyFormItemValid(prop: PropertyFormItem): boolean {
    return (
      prop.selectedOperator === OPERATORS.Exists || prop.selectedOperator === OPERATORS.NotExists || !!prop.searchValue
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
