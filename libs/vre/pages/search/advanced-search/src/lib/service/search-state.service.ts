import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { StatementElement, OrderByItem, SearchFormsState, IriLabelPair } from '../model';
import { AdvancedSearchDataService } from './advanced-search-data.service';

@Injectable()
export class SearchStateService {
  private readonly INITIAL_FORMS_STATE: SearchFormsState = {
    selectedResourceClass: undefined,
    statementElements: [new StatementElement(undefined, 0)],
    orderBy: [],
  } as const;

  private _dataService = inject(AdvancedSearchDataService);

  private _state = new BehaviorSubject<SearchFormsState>(this.INITIAL_FORMS_STATE);

  selectedResourceClass$ = this._state.pipe(
    distinctUntilChanged(),
    map(state => state.selectedResourceClass)
  );

  statementElements$ = this._state.pipe(
    map(state => state.statementElements),
    distinctUntilChanged(),
    startWith(this.INITIAL_FORMS_STATE.statementElements)
  );

  completeStatements$ = this._state.pipe(
    distinctUntilChanged(),
    map(state => state.statementElements),
    map(elements => elements.filter(prop => prop.isValidAndComplete)),
    distinctUntilChanged()
  );

  orderByItems$ = this._state.pipe(
    distinctUntilChanged(),
    map(state => state.orderBy),
    distinctUntilChanged()
  );

  isFormStateValidAndComplete$ = this._state.pipe(
    distinctUntilChanged(),
    map(state => state.statementElements),
    map(elements => {
      return elements.length > 1 && elements.every(statement => statement.isValidAndComplete || statement.isPristine);
    }),
    distinctUntilChanged()
  );

  get currentState(): SearchFormsState {
    return this._state.value;
  }

  get validStatementElements() {
    return this._state.value.statementElements.filter(statement => statement.isValidAndComplete);
  }

  patchState(state: Partial<SearchFormsState>): void {
    const newState: SearchFormsState = {
      ...this._state.value,
      ...state,
    };
    this._state.next(newState);
  }

  clearAllSelections(): void {
    this.patchState(this.INITIAL_FORMS_STATE);
  }

  updateStatement(statement: StatementElement): void {
    this.patchState({
      statementElements: this._state.value.statementElements.map(p => (p.id === statement.id ? statement : p)),
    });
  }

  updateOrderBy(orderByItems: OrderByItem[]): void {
    this.patchState({ orderBy: orderByItems });
  }
}
