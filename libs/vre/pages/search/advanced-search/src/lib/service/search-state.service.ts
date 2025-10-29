import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, startWith } from 'rxjs';
import { StatementElement, OrderByItem, SearchFormsState } from '../model';
import { Operator } from '../operators.config';

@Injectable()
export class SearchStateService {
  private readonly INITIAL_FORMS_STATE: SearchFormsState = {
    selectedResourceClass: undefined,
    statementElements: [new StatementElement()],
    propertiesOrderBy: [],
  } as const;

  private _state = new BehaviorSubject<SearchFormsState>(this.INITIAL_FORMS_STATE);

  statementElements$ = this._state.pipe(
    map(state => state.statementElements),
    startWith(this.INITIAL_FORMS_STATE.statementElements),
    distinctUntilChanged()
  );

  nonEmptyStatementElements$ = this.statementElements$.pipe(
    map(elements => elements.filter(prop => !!prop.selectedPredicate)),
    distinctUntilChanged()
  );

  propertiesOrderBy$ = this._state.pipe(
    map(state => state.propertiesOrderBy),
    distinctUntilChanged()
  );

  isFormStateValid$ = this.statementElements$.pipe(
    map(propertyFormList => {
      const hasInvalidPropertyForms = propertyFormList.some(prop => !this.isPropertyFormItemValid(prop));
      return !hasInvalidPropertyForms && propertyFormList.some(prop => prop.selectedPredicate);
    }),
    distinctUntilChanged()
  );

  get currentState(): SearchFormsState {
    return this._state.value;
  }

  get nonEmptyStatementElements() {
    return this._state.value.statementElements.filter(prop => prop.selectedPredicate);
  }

  patchState(partialState: Partial<SearchFormsState>): void {
    this._state.next({ ...this._state.value, ...partialState });
    console.log('SearchStateService - new state:', this._state.value);
  }

  clearAllSelections() {
    this.patchState({ selectedResourceClass: undefined });
    this.clearPropertySelections();
  }

  clearPropertySelections() {
    this.patchState({ statementElements: [new StatementElement()] });
    this.patchState({ propertiesOrderBy: [] });
  }

  updateStatement(property: StatementElement): void {
    this.patchState({
      statementElements: this._state.value.statementElements.map(p => (p.id === property.id ? property : p)),
    });
  }

  updateOrderBy(orderByList: OrderByItem[]): void {
    this.patchState({ propertiesOrderBy: orderByList });
  }

  isPropertyFormItemValid(prop: StatementElement): boolean {
    return (
      prop.selectedOperator === Operator.Exists ||
      prop.selectedOperator === Operator.NotExists ||
      !!prop.selectedObjectNode
    );
  }
}
