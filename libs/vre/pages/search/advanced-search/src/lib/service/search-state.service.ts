import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, startWith, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { StatementElement, OrderByItem, SearchFormsState, IriLabelPair, NodeValue } from '../model';
import { Operator } from '../operators.config';

@Injectable()
export class SearchStateService {
  private readonly INITIAL_FORMS_STATE: SearchFormsState = {
    stateId: uuidv4(),
    selectedResourceClass: undefined,
    statementElements: [new StatementElement(undefined, 0)],
    orderBy: [],
  } as const;

  private _state = new BehaviorSubject<SearchFormsState>(this.INITIAL_FORMS_STATE);

  private _undoStack: SearchFormsState[] = [];
  private _redoStack: SearchFormsState[] = [];
  private readonly MAX_HISTORY_SIZE = 50;

  canUndo$ = new BehaviorSubject<boolean>(false);
  canRedo$ = new BehaviorSubject<boolean>(false);

  selectedResourceClass$ = this._state.pipe(
    distinctUntilChanged(),
    map(state => state.selectedResourceClass)
  );

  statementElements$ = this._state.pipe(
    map(state => state.statementElements),
    distinctUntilChanged(),
    startWith(this.INITIAL_FORMS_STATE.statementElements)
  );

  nonEmptyStatementElements$ = this._state.pipe(
    distinctUntilChanged(),
    map(state => state.statementElements),
    map(elements => elements.filter(prop => !!prop.selectedPredicate)),
    distinctUntilChanged()
  );

  orderByItems$ = this._state.pipe(
    distinctUntilChanged(),
    map(state => state.orderBy)
  );

  isFormStateValidAndComplete$ = this._state.pipe(
    distinctUntilChanged(),
    map(state => state.statementElements),
    map(elements => {
      return elements.every(statement => statement.isValidAndComplete);
    }),
    tap(isValid => console.log('Form state valid and complete:', isValid)),
    distinctUntilChanged()
  );

  get currentState(): SearchFormsState {
    return this._state.value;
  }

  get validStatementElements() {
    return this._state.value.statementElements.filter(statement => statement.isValidAndComplete);
  }

  patchState(state: Partial<SearchFormsState>, trackChanges = true): void {
    // Only track changes when explicitly requested
    if (trackChanges && this._isTrackableChange(state)) {
      this._pushToUndoStack(this._state.value);
      this._redoStack = [];
    }

    const newState: SearchFormsState = {
      ...this._state.value,
      ...state,
      // Only generate new stateId if tracking changes
      stateId: trackChanges && this._isTrackableChange(state) ? uuidv4() : this._state.value.stateId,
    };

    this._state.next(newState);

    if (trackChanges) {
      this._updateHistoryFlags();
    }
  }

  clearAllSelections(): void {
    this.patchState(this.INITIAL_FORMS_STATE);
  }

  updateStatement(statement: StatementElement): void {
    this.patchState({
      statementElements: this._state.value.statementElements.map(p => (p.id === statement.id ? statement : p)),
    });
  }

  updateOrderBy(orderByList: OrderByItem[]): void {
    this.patchState({ orderBy: orderByList }, false);
  }

  private _pushToUndoStack(state: SearchFormsState): void {
    this._undoStack.push(state);
    if (this._undoStack.length > this.MAX_HISTORY_SIZE) {
      this._undoStack.shift();
    }
  }

  private _updateHistoryFlags(): void {
    this.canUndo$.next(this._undoStack.length > 0);
    this.canRedo$.next(this._redoStack.length > 0);
  }

  get canUndo(): boolean {
    return this._undoStack.length > 0;
  }

  undoLastChange(): void {
    if (!this.canUndo) {
      return;
    }

    const previousState = this._undoStack.pop();
    if (previousState) {
      this._redoStack.push(this._state.value);
      if (this._redoStack.length > this.MAX_HISTORY_SIZE) {
        this._redoStack.shift();
      }

      this._state.next(previousState);
      this._updateHistoryFlags();
    }
  }

  get canRedo(): boolean {
    return this._redoStack.length > 0;
  }

  redoLastChange(): void {
    if (!this.canRedo) {
      return;
    }

    const nextState = this._redoStack.pop();
    if (nextState) {
      // Save current state to undo stack before going forward
      this._pushToUndoStack(this._state.value);

      // Restore next state (don't generate new ID!)
      this._state.next(nextState);
      this._updateHistoryFlags();
    }
  }

  private _isTrackableChange(newState: Partial<SearchFormsState>): boolean {
    return (
      newState.statementElements?.length !== this._state.value.statementElements.length ||
      newState.selectedResourceClass !== this._state.value.selectedResourceClass
    );
  }
}
