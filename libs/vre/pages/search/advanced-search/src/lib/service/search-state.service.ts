import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, shareReplay, Subject } from 'rxjs';
import { PropertyFormItem, OrderByItem, ParentChildPropertyPair, SearchFormsState, ApiData } from '../model';
import { EMPTY_PROPERTY_FORM_ITEM, INITIAL_FORMS_STATE } from '../util';
import { Operators } from './operators.config';

@Injectable()
export class SearchStateService {
  private _state = new BehaviorSubject<SearchFormsState>(INITIAL_FORMS_STATE);

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

  isFormStateValid$ = this.propertyForms$.pipe(
    map(propertyFormList => {
      const hasInvalidPropertyForms = propertyFormList.some(prop => !this.isPropertyFormItemValid(prop));
      return !hasInvalidPropertyForms && propertyFormList.some(prop => prop.selectedProperty);
    }),
    distinctUntilChanged()
  );

  get currentState(): SearchFormsState {
    return this._state.value;
  }

  patchState(partialState: Partial<SearchFormsState>): void {
    this._state.next({ ...this._state.value, ...partialState });
  }

  updatePropertyListItem(propertyFormList: PropertyFormItem[], property: PropertyFormItem, index: number): void {
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

  deleteChildPropertyFormList(property: ParentChildPropertyPair): void {
    const currentPropertyFormList = this._state.value.propertyFormList;
    const indexInPropertyFormList = currentPropertyFormList.indexOf(property.parentProperty);

    const currentSearchValue =
      (currentPropertyFormList[indexInPropertyFormList].searchValue as PropertyFormItem[]) || [];
    const updatedSearchValue = currentSearchValue.filter(item => item.id !== property.childProperty.id);

    const updatedProp = currentPropertyFormList[indexInPropertyFormList];
    updatedProp.searchValue = updatedSearchValue;

    this.updatePropertyListItem(currentPropertyFormList, updatedProp, indexInPropertyFormList);
  }

  reset() {
    this.patchState({ selectedOntology: this._state.value.ontologies[0] });
    this.patchState({ selectedResourceClass: undefined });
    this.patchState({ propertyFormList: [EMPTY_PROPERTY_FORM_ITEM] });
    this.patchState({ propertiesOrderBy: [] });
  }

  isPropertyFormItemValid(prop: PropertyFormItem): boolean {
    return (
      prop.selectedOperator === Operators.Exists || prop.selectedOperator === Operators.NotExists || !!prop.searchValue
    );
  }
}
