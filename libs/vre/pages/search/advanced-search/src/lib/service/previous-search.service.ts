import { Injectable } from '@angular/core';
import {
  AdvancedSearchStateSnapshot,
  IriLabelPair,
  NodeValue,
  SearchFormsState,
  StatementElement,
  StringValue,
} from '../model';

@Injectable()
export class PreviousSearchService {
  private readonly STORAGE_KEY = 'advanced-search-previous-search';

  private _previousSearchObject: AdvancedSearchStateSnapshot = {} as AdvancedSearchStateSnapshot;

  private reconstructObjectNode(objNode: any): NodeValue | StringValue | undefined {
    if (objNode?._value && typeof objNode._value === 'object' && 'iri' in objNode._value) {
      return new NodeValue(objNode.statementId, objNode._value);
    }

    if (objNode?._value && typeof objNode._value === 'string') {
      return new StringValue(objNode.statementId, objNode._value);
    }
    if (typeof objNode === 'object' && objNode.statementId) {
      return new NodeValue(objNode.statementId, objNode._value);
    }

    return undefined;
  }

  private reconstructStatementElements(plainObjects: any[]): StatementElement[] {
    if (!plainObjects || plainObjects.length === 0) {
      return [];
    }

    return plainObjects.map(obj => {
      // Reconstruct NodeValue for subject if it exists
      let subjectNode: NodeValue | undefined;
      if (obj._selectedSubjectNode) {
        subjectNode = new NodeValue(obj.id, obj._selectedSubjectNode._value);
      }

      const element = new StatementElement(subjectNode, obj.statementLevel);

      // Restore all properties using setters to maintain class behavior
      element.selectedPredicate = obj._selectedPredicate;
      element.selectedOperator = obj._selectedOperator;
      element.selectedObjectNode = this.reconstructObjectNode(obj._selectedObjectNode);
      element.listObject = obj.listObject;

      return element;
    });
  }

  get previousSearchObject(): AdvancedSearchStateSnapshot {
    return {
      ...this._previousSearchObject,
      statementElements: this.reconstructStatementElements(this._previousSearchObject.statementElements || []),
    };
  }

  init(projectIri: string): void {
    const storedSearches = localStorage.getItem(this.STORAGE_KEY) || '{}';
    this._previousSearchObject =
      (JSON.parse(storedSearches)[projectIri] as AdvancedSearchStateSnapshot) || ({} as AdvancedSearchStateSnapshot);
  }

  storeSearchSnapshot(projectIri: string, ontology: IriLabelPair, state: SearchFormsState): void {
    const snapshot: AdvancedSearchStateSnapshot = {
      selectedOntology: ontology,
      selectedResourceClass: state.selectedResourceClass,
      statementElements: state.statementElements,
      orderBy: state.orderBy,
    };

    const storedSearch = localStorage.getItem(this.STORAGE_KEY);
    const projectPreviousSearch: Record<string, SearchFormsState> = storedSearch ? JSON.parse(storedSearch) : {};
    projectPreviousSearch[projectIri] = snapshot;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projectPreviousSearch));
  }

  hasPreviousSearch(): boolean {
    return !!this.previousSearchObject.selectedOntology;
  }
}
