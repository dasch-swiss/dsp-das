import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, shareReplay, Subject } from 'rxjs';
import { PropertyFormItem, OrderByItem, ParentChildPropertyPair, SearchFormsState, ApiData } from '../model';
import { INITIAL_FORMS_STATE } from '../util';
import { Operator } from './operators.config';

@Injectable()
export class SearchStateService {
  private _state = new BehaviorSubject<SearchFormsState>(INITIAL_FORMS_STATE);

  propertyForms$ = this._state.pipe(
    map(state => state.propertyFormList),
    distinctUntilChanged()
  );

  propertiesOrderBy$ = this._state.pipe(
    map(state => state.propertiesOrderBy),
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

  updatePropertyForm(property: PropertyFormItem): void {
    this.patchState({
      propertyFormList: this._state.value.propertyFormList.map(p => (p.id === property.id ? property : p)),
    });
  }

  updatePropertyOrderBy(orderByList: OrderByItem[]): void {
    this.patchState({ propertiesOrderBy: orderByList });
  }

  updateChildSearchValue({ parentProperty, childProperty }: ParentChildPropertyPair): void {
    if (Array.isArray(parentProperty.searchValue)) {
      parentProperty.searchValue = parentProperty.searchValue.map(c => (c.id === childProperty.id ? childProperty : c));
    }
    this.updatePropertyForm(parentProperty);
  }

  deleteChildPropertyFormList({ parentProperty, childProperty }: ParentChildPropertyPair): void {
    if (Array.isArray(parentProperty.searchValue)) {
      parentProperty.searchValue = parentProperty.searchValue.filter(c => c.id !== childProperty.id);
    }
    this.updatePropertyForm(parentProperty);
  }

  clear() {
    this.patchState({ selectedResourceClass: undefined });
    this.patchState({ propertyFormList: [new PropertyFormItem()] });
    this.patchState({ propertiesOrderBy: [] });
  }

  isPropertyFormItemValid(prop: PropertyFormItem): boolean {
    return (
      prop.selectedOperator === Operator.Exists || prop.selectedOperator === Operator.NotExists || !!prop.searchValue
    );
  }
}
