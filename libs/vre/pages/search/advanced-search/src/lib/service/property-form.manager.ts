import { Injectable, inject, OnDestroy } from '@angular/core';
import {
  tap,
  catchError,
  EMPTY,
  take,
  map,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  combineLatest,
  Subject,
  filter,
} from 'rxjs';
import { PropertyFormItem, PropertyData, ApiData, ParentChildPropertyPair, SearchItem, OrderByItem } from '../model';
import { INITIAL_FORMS_STATE } from '../util';
import { AdvancedSearchDataService } from './advanced-search-data.service';
import { Operators } from './operators.config';
import { SearchStateService } from './search-state.service';

@Injectable()
export class PropertyFormManager implements OnDestroy {
  private apiService = inject(AdvancedSearchDataService);
  private searchStateService = inject(SearchStateService);

  private _destroy$ = new Subject<void>();

  constructor() {
    this.apiService
      .getProperties$()
      .pipe(
        take(1),
        tap(properties => {
          console.log('Loaded properties for all resource classes:', properties);

          this.searchStateService.patchState({
            properties: properties || [],
            filteredProperties: properties || [],
            propertiesLoading: false,
          });
        })
      )
      .subscribe();

    this.apiService.resourceClassesList$.subscribe(resourceClasses => {
      this.searchStateService.patchState({
        resourceClasses: resourceClasses || [],
        resourceClassesLoading: false,
      });
    });

    this.searchStateService.selectedResourceClass$
      .pipe(
        takeUntil(this._destroy$),
        distinctUntilChanged((prev, curr) => prev?.iri === curr?.iri),
        switchMap(resourceClass => {
          return this.apiService.getProperties$(resourceClass?.iri).pipe(
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
            .map(
              form =>
                ({
                  id: form.selectedProperty?.iri,
                  label: form.selectedProperty!.label,
                  orderBy: false,
                  disabled: false,
                }) as OrderByItem
            );

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

    this.searchStateService.selectedOntology$
      .pipe(
        filter(ontology => !!ontology),
        takeUntil(this._destroy$)
      )
      .subscribe(ontology => {
        this.apiService.initWithOntology(ontology.iri);
      });
  }

  init(projectIri: string): void {
    this.searchStateService.patchState({
      ...INITIAL_FORMS_STATE,
      selectedProject: projectIri,
    });

    this.apiService
      .ontologies$(projectIri)
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

  /**
   * Loads list data for a property if needed (separate async operation)
   */
  private loadListForProperty(property: PropertyFormItem): void {
    if (!property.selectedProperty?.listIri) {
      return;
    }

    this.apiService
      .getList(property.selectedProperty.listIri)
      .pipe(
        take(1),
        tap(list => {
          if (list) {
            property.list = list;
            // Re-patch state after list is loaded
            this.searchStateService.updatePropertyForm(property);
          }
        }),
        catchError(error => {
          console.error('Error loading list for property:', error);
          this.searchStateService.patchState({ error });
          return EMPTY;
        })
      )
      .subscribe();
  }

  updateSelectedOperator(form: PropertyFormItem, operator: Operators): PropertyFormItem {
    form.selectedOperator = operator;
    return form;
  }

  updateSelectedOntology(ontology: ApiData): void {
    this.searchStateService.patchState({
      selectedOntology: ontology,
      selectedResourceClass: undefined,
      propertyFormList: [new PropertyFormItem()],
      propertiesOrderBy: [],
    });
  }

  updateSelectedResourceClass(resourceClass: ApiData): void {
    this.searchStateService.patchState({
      selectedResourceClass: resourceClass,
      propertyFormList: [new PropertyFormItem()],
      propertiesOrderBy: [],
    });
  }

  deletePropertyForm(property: PropertyFormItem): void {
    const currentState = this.searchStateService.currentState;
    const updatedPropertyFormList = currentState.propertyFormList.filter(item => item !== property);
    const updatedOrderByList = currentState.propertiesOrderBy.filter(item => item.id !== property.id);

    this.searchStateService.patchState({
      propertyFormList: updatedPropertyFormList,
      propertiesOrderBy: updatedOrderByList,
    });
  }

  addChildPropertyFormList(property: PropertyFormItem): void {
    property.addChildProperty();
    this.searchStateService.updatePropertyForm(property);
  }

  updateChildProperty(child: PropertyFormItem, parent: PropertyFormItem): void {}

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

      this.searchStateService.updatePropertyForm(property.parentProperty);
    }
  }

  onPropertySelectionChanged(property: PropertyFormItem, selectedProperty: PropertyData): void {
    property.selectedProperty = selectedProperty;
    this.searchStateService.updatePropertyForm(property);
    if (property.selectedProperty.listIri) {
      this.loadListForProperty(property);
    }
  }

  onOperatorSelectionChanged(property: PropertyFormItem, selectedOperator: Operators): void {
    property.selectedOperator = selectedOperator;
    // Todo: Add matches or so
    this.searchStateService.updatePropertyForm(property);
  }

  /**
   * Handles match property resource class selection change - completely stateless
   */
  onMatchPropertyResourceClassChanged(property: PropertyFormItem, selectedResourceClass: ApiData): void {
    const currentState = this.searchStateService.currentState;
    const currentPropertyFormList = currentState.propertyFormList;
    const index = currentPropertyFormList.indexOf(property);

    if (index === -1) {
      return;
    }

    property.selectedMatchPropertyResourceClass = selectedResourceClass;

    this.apiService
      .getProperties$(selectedResourceClass.iri)
      .pipe(
        take(1),
        tap(properties => {
          property.childPropertiesList = properties;
          property.searchValue = [];
          this.searchStateService.updatePropertyForm(property);
        }),
        catchError(error => {
          console.error('Error loading filtered properties:', error);
          this.searchStateService.patchState({ error });
          return EMPTY;
        })
      )
      .subscribe();
  }

  /**
   * Handles search value change - completely stateless
   */
  onSearchValueChanged(property: PropertyFormItem, searchValue: string | ApiData | PropertyFormItem[]): void {
    const currentState = this.searchStateService.currentState;
    const currentPropertyFormList = currentState.propertyFormList;
    const index = currentPropertyFormList.indexOf(property);

    if (index === -1) {
      return;
    }

    // Handle different types of search values
    if (this._isApiData(searchValue)) {
      property.searchValue = searchValue.iri;
      property.searchValueLabel = searchValue.label;
    } else {
      property.searchValue = searchValue;
    }
    this.searchStateService.updatePropertyForm(property);
  }

  // Type guard function to check if the value adheres to ApiData interface
  private _isApiData(value: any): value is ApiData {
    return value && typeof value === 'object' && 'iri' in value && 'label' in value;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
