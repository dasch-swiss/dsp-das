import { Injectable, inject } from '@angular/core';
import { tap, map, distinctUntilChanged, filter } from 'rxjs';
import { PropertyFormItem, PropertyData, ApiData, ParentChildPropertyPair, SearchItem, OrderByItem } from '../model';
import { Operator } from './operators.config';
import { SearchStateService } from './search-state.service';

@Injectable()
export class PropertyFormManager {
  private searchStateService = inject(SearchStateService);

  constructor() {
    this.searchStateService.propertyForms$
      .pipe(
        map(forms => {
          const distinctFormsById = new Map(
            forms
              .filter(f => f.selectedProperty)
              .map(({ selectedProperty }) => [selectedProperty.iri, selectedProperty.label])
          );

          const toKeep = this.searchStateService.currentState.propertiesOrderBy.filter(i =>
            distinctFormsById.has(i.id)
          );

          const toAdd = [...distinctFormsById]
            .filter(([id]) => !toKeep.some(i => i.id === id))
            .map(([id, label]) => new OrderByItem(id, label));

          return [...toKeep, ...toAdd];
        })
      )
      .subscribe(orderByList => {
        this.searchStateService.updatePropertyOrderBy(orderByList);
      });
  }

  loadMoreResourcesSearchResults(searchItem: SearchItem): void {
    throw new Error('Method not implemented.');
  }

  updateSelectedOperator(form: PropertyFormItem, operator: Operator): PropertyFormItem {
    form.selectedOperator = operator;
    return form;
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
  }

  onOperatorSelectionChanged(property: PropertyFormItem, selectedOperator: Operator): void {
    property.selectedOperator = selectedOperator;
    this.searchStateService.updatePropertyForm(property);
  }

  /**
   * Handles match property resource class selection change - completely stateless
   */
  onMatchPropertyResourceClassChanged(property: PropertyFormItem, selectedResourceClass: ApiData): void {
    console.error('not implemented yet');
  }

  /**
   * Handles search value change - completely stateless
   */
  onSearchValueChanged(property: PropertyFormItem, searchValue: string | ApiData): void {
    const currentState = this.searchStateService.currentState;
    const currentPropertyFormList = currentState.propertyFormList;
    const index = currentPropertyFormList.indexOf(property);

    if (index === -1) {
      return;
    }
    property.searchValue = searchValue;
    this.searchStateService.updatePropertyForm(property);
  }

  // Type guard function to check if the value adheres to ApiData interface
  private _isApiData(value: any): value is ApiData {
    return value && typeof value === 'object' && 'iri' in value && 'label' in value;
  }
}
