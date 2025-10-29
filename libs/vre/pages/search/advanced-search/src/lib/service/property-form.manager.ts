import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { StatementElement, Predicate, IriLabelPair, SearchItem, OrderByItem, NodeValue, StringValue } from '../model';
import { Operator } from '../operators.config';
import { AdvancedSearchDataService } from './advanced-search-data.service';
import { SearchStateService } from './search-state.service';

@Injectable()
export class PropertyFormManager {
  private searchStateService = inject(SearchStateService);
  private _dataService = inject(AdvancedSearchDataService);

  constructor() {
    this.searchStateService.nonEmptyStatementElements$
      .pipe(
        map(forms => {
          const distinctFormsById = new Map(
            forms.map(({ selectedPredicate }) => [selectedPredicate!.iri, selectedPredicate!.label])
          );

          const toKeep = this.searchStateService.currentState.propertiesOrderBy.filter(item =>
            distinctFormsById.has(item.id)
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

  updateSelectedResourceClass(resourceClass: IriLabelPair): void {
    this._dataService.setSelectedResourceClass(resourceClass);
    this.searchStateService.clearPropertySelections();
  }

  loadMoreResourcesSearchResults(searchItem: SearchItem): void {
    throw new Error('Method not implemented.');
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

  setSelectedOperator(statement: StatementElement, selectedOperator: Operator): void {
    statement.selectedOperator = selectedOperator;
    this._dataService.getObjectsForProperty$(statement.selectedPredicate!.iri).subscribe(objects => {
      statement.availableObjects = objects;
      this.searchStateService.updateStatement(statement);
    });
  }

  setObjectValue(statement: StatementElement, searchValue: string | IriLabelPair): void {
    statement.selectedObjectValue = searchValue;
    this.searchStateService.updateStatement(statement);
  }
}
