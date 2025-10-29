import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { SEARCH_ALL_RESOURCE_CLASSES_OPTION } from '../constants';
import { StatementElement, Predicate, IriLabelPair, SearchItem, OrderByItem } from '../model';
import { Operator } from '../operators.config';
import { AdvancedSearchDataService } from './advanced-search-data.service';
import { SearchStateService } from './search-state.service';

@Injectable()
export class PropertyFormManager {
  private searchStateService = inject(SearchStateService);
  private _dataService = inject(AdvancedSearchDataService);

  constructor() {
    this.searchStateService.statementElements$
      .pipe(
        map(forms => {
          const distinctFormsById = new Map(
            forms
              .filter(f => f.selectedPredicate)
              .map(({ selectedPredicate }) => [selectedPredicate.iri, selectedPredicate.label])
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
        this.searchStateService.updateOrderBy(orderByList);
      });
  }

  updateSelectedResourceClass(resourceClass: IriLabelPair = SEARCH_ALL_RESOURCE_CLASSES_OPTION): void {
    console.log('Updating selected resource class to', resourceClass);
    this._dataService.setSelectedResourceClass(resourceClass);
    this.searchStateService.clearPropertySelections();
  }

  loadMoreResourcesSearchResults(searchItem: SearchItem): void {
    throw new Error('Method not implemented.');
  }

  updateSelectedOperator(form: StatementElement, operator: Operator): StatementElement {
    form.selectedOperator = operator;
    return form;
  }

  deleteStatement(statement: StatementElement): void {
    const currentState = this.searchStateService.currentState;
    const updatedPropertyFormList = currentState.statementElements.filter(item => item !== statement);
    const updatedOrderByList = currentState.propertiesOrderBy.filter(item => item.id !== statement.id);

    this.searchStateService.patchState({
      statementElements: updatedPropertyFormList,
      propertiesOrderBy: updatedOrderByList,
    });
  }

  onPredicateSelectionChanged(statement: StatementElement, selectedProperty: Predicate): void {
    statement.selectedPredicate = selectedProperty;
    this.searchStateService.updateStatement(statement);
  }

  onOperatorSelectionChanged(statement: StatementElement, selectedOperator: Operator): void {
    statement.selectedOperator = selectedOperator;
    this._dataService.getObjectsForProperty$(statement.selectedPredicate!.iri).subscribe(objects => {
      statement.availableObjects = objects;
      this.searchStateService.updateStatement(statement);
    });
  }

  selectObject(statementElement: StatementElement, selectedResourceClass: IriLabelPair): void {
    console.error('not implemented yet');
  }

  setObjectValue(statement: StatementElement, searchValue: string | IriLabelPair): void {
    const currentState = this.searchStateService.currentState;
    const currentPropertyFormList = currentState.statementElements;
    const index = currentPropertyFormList.indexOf(statement);

    if (index === -1) {
      return;
    }
    statement.selectedObjectNode.value = searchValue;
    this.searchStateService.updateStatement(statement);
  }
}
