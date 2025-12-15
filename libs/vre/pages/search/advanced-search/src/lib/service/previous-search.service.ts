import { Injectable } from '@angular/core';
import { AdvancedSearchStateSnapshot, IriLabelPair, SearchFormsState } from '../model';

@Injectable()
export class PreviousSearchService {
  private readonly STORAGE_KEY = 'advanced-search-previous-search';

  private _previousSearchObject: AdvancedSearchStateSnapshot = {} as AdvancedSearchStateSnapshot;

  get previousSearchObject(): AdvancedSearchStateSnapshot {
    return this._previousSearchObject;
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
