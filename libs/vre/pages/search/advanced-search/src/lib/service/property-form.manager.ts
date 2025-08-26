import { Injectable, inject } from '@angular/core';
import { Observable, tap, catchError, EMPTY, take, map, startWith, distinctUntilChanged } from 'rxjs';
import { PropertyFormItem, PropertyData, OrderByItem } from '../model';
import { updateOrderByList, EMPTY_CHILD_PROPERTY_FORM_ITEM } from '../util';
import { AdvancedSearchApiService } from './advanced-search-api.service';
import { Operators, getOperatorsForObjectType, getDefaultLinkedResourceOperators } from './operators.config';
import { SearchStateService } from './search-state.service';

/**
 * Service responsible for managing property form operations.
 * Handles form creation, validation, updates, and business logic.
 */
@Injectable({
  providedIn: 'root',
})
export class PropertyFormManager {
  private advancedSearchService = inject(AdvancedSearchApiService);
  private searchService = inject(SearchStateService);

  isFormValid$ = this.searchService.propertyForms$.pipe(
    map(propertyFormList => {
      const hasInvalidPropertyForms = propertyFormList.some(prop => !this.isPropertyFormItemValid(prop));
      return !hasInvalidPropertyForms && propertyFormList.some(prop => prop.selectedProperty);
    }),
    startWith(true),
    distinctUntilChanged()
  );

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

    // Set available operators based on object type
    const objectType = property.objectType;
    if (objectType) {
      const operators = getOperatorsForObjectType(objectType);

      // If no matching operators found, it's a linked resource property
      if (!operators.length) {
        updatedForm.operators = getDefaultLinkedResourceOperators();
      } else {
        updatedForm.operators = operators;
      }
    }

    // Load list if property has a listIri
    if (property.listIri && onListLoaded && onLoadingStart && onError) {
      onLoadingStart();
      this.advancedSearchService
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

  /**
   * Updates the order by list when a property form changes
   */
  updateOrderByList(currentOrderBy: OrderByItem[], form: PropertyFormItem): OrderByItem[] {
    return updateOrderByList(currentOrderBy, form);
  }

  isPropertyFormItemValid(prop: PropertyFormItem): boolean {
    return (
      prop.selectedOperator === Operators.Exists || prop.selectedOperator === Operators.NotExists || !!prop.searchValue
    );
  }
}
