import { Injectable, inject, OnDestroy } from '@angular/core';
import { map, Subject, takeUntil } from 'rxjs';
import { StatementElement, Predicate, IriLabelPair, OrderByItem, NodeValue } from '../model';
import { Operator } from '../operators.config';
import { SearchStateService } from './search-state.service';

@Injectable()
export class PropertyFormManager implements OnDestroy {
  private searchStateService = inject(SearchStateService);
  private destroy$ = new Subject<void>();

  areFormsCompleteAndValid$ = this.searchStateService.isFormStateValidAndComplete$;

  constructor() {
    this.searchStateService.nonEmptyStatementElements$
      .pipe(
        takeUntil(this.destroy$),
        map(forms => {
          const distinctFormsById = new Map(
            forms.map(({ selectedPredicate }) => [selectedPredicate!.iri, selectedPredicate!.label])
          );

          const toKeep = this.searchStateService.currentState.orderBy.filter(item => distinctFormsById.has(item.id));

          const toAdd = [...distinctFormsById]
            .filter(([id]) => !toKeep.some(i => i.id === id))
            .map(([id, label]) => new OrderByItem(id, label));

          return [...toKeep, ...toAdd];
        })
      )
      .subscribe(orderByList => {
        this.searchStateService.updateOrderBy(orderByList);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setMainResource(resourceClass: IriLabelPair | undefined): void {
    const nodeValue = resourceClass ? new NodeValue(resourceClass.iri, resourceClass) : undefined;
    const statement = new StatementElement(nodeValue, 0);
    this.searchStateService.patchState({
      selectedResourceClass: resourceClass,
      statementElements: [statement],
      orderBy: [],
    });
  }

  deleteStatement(statement: StatementElement): void {
    const currentState = this.searchStateService.currentState;
    const updatedPropertyFormList = currentState.statementElements.filter(item => item !== statement);
    const updatedOrderByList = currentState.orderBy.filter(item => item.id !== statement.id);

    this.searchStateService.patchState({
      statementElements: updatedPropertyFormList,
      orderBy: updatedOrderByList,
    });
  }

  onPredicateSelectionChanged(statement: StatementElement, selectedProperty: Predicate): void {
    statement.selectedPredicate = selectedProperty;
    this.searchStateService.updateStatement(statement);
  }

  setSelectedOperator(statement: StatementElement, selectedOperator: Operator): void {
    statement.selectedOperator = selectedOperator;
    this.searchStateService.updateStatement(statement);
    if (statement.isValidAndComplete && this._isLastForSameSubject(statement)) {
      this._addEmptyStatement(statement);
    }
  }

  setObjectValue(statement: StatementElement, searchValue: string | IriLabelPair): void {
    statement.selectedObjectValue = searchValue;
    this.searchStateService.updateStatement(statement);
    if (statement.isValidAndComplete && this._isLastForSameSubject(statement)) {
      this._addEmptyStatement(statement);
    }
  }

  addChildStatement(parentStatement: StatementElement): void {}

  private _addEmptyStatement(currentStatement: StatementElement): void {
    const currentState = this.searchStateService.currentState;
    this.searchStateService.patchState({
      statementElements: [
        ...currentState.statementElements,
        new StatementElement(currentStatement.selectedSubjectNode!, currentStatement.statementLevel),
      ],
    });
  }

  private _isLastForSameSubject(statement: StatementElement): boolean {
    const currentState = this.searchStateService.currentState;
    const statementsOfSameLevel = currentState.statementElements.filter(
      s =>
        s.statementLevel === statement.statementLevel &&
        s.selectedSubjectNode?.value &&
        s.selectedSubjectNode.value.iri === statement.selectedSubjectNode?.value?.iri
    );
    return statementsOfSameLevel[statementsOfSameLevel.length - 1] === statement;
  }
}
