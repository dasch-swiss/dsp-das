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
      return this.reconstructStatement(obj);
    });
  }

  reconstructStatement(obj: any): StatementElement {
    let subjectNode: NodeValue | undefined;
    if (obj._selectedSubjectNode) {
      subjectNode = new NodeValue(obj.idx, obj._selectedSubjectNode._value);
    }

    const parentStatement = obj._parentStatement ? this.reconstructStatement(obj._parentStatement) : undefined;

    const element = new StatementElement(subjectNode, obj.statementLevel, parentStatement);
    element.selectedPredicate = obj._selectedPredicate;
    element.selectedOperator = obj._selectedOperator;
    element.selectedObjectNode = this.reconstructObjectNode(obj._selectedObjectNode);

    return element;
  }

  get previousSearchObject(): AdvancedSearchStateSnapshot {
    const statementElements = this.reconstructStatementElements(this._previousSearchObject.statementElements || []);
    console.log('Reconstructed statementElements:', statementElements);
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
