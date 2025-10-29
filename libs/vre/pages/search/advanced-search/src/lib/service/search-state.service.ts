import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, startWith } from 'rxjs';
import { StatementElement, OrderByItem, SearchFormsState } from '../model';
import { Operator } from '../operators.config';

@Injectable()
export class SearchStateService {
  private readonly INITIAL_FORMS_STATE: SearchFormsState = {
    selectedResourceClass: undefined,
    statementElements: [new StatementElement()],
    orderBy: [],
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

  orderByItems$ = this._state.pipe(
    map(state => state.orderBy),
    distinctUntilChanged()
  );

  isFormStateValid$ = this.statementElements$.pipe(
    map(elements => {
      return elements.every(statement => statement.isValidAndComplete);
    }),
    distinctUntilChanged()
  );

  get currentState(): SearchFormsState {
    return this._state.value;
  }

  get validStatementElements() {
    return this._state.value.statementElements.filter(statement => statement.isValidAndComplete);
  }

  patchState(partialState: Partial<SearchFormsState>): void {
    this._state.next({ ...this._state.value, ...partialState });
    console.log('SearchStateService - new state:', this._state.value);
  }

  clearAllSelections() {
    this.patchState({ selectedResourceClass: undefined });
    this.clearStatements();
  }

  clearStatements() {
    this.patchState({ statementElements: [new StatementElement()] });
    this.patchState({ orderBy: [] });
  }

  updateStatement(statement: StatementElement): void {
    this.patchState({
      statementElements: this._state.value.statementElements.map(p => (p.id === statement.id ? statement : p)),
    });
  }

  updateOrderBy(orderByList: OrderByItem[]): void {
    this.patchState({ orderBy: orderByList });
  }
}
