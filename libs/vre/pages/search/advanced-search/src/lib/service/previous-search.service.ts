import { Injectable } from '@angular/core';
import { AdvancedSearchStateSnapshot, ApiData, SearchFormsState } from '../model';
import { INITIAL_FORMS_STATE } from '../util';

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

  storeSearchSnapshot(projectIri: string, ontology: ApiData, state: SearchFormsState): void {
    const snapshot: AdvancedSearchStateSnapshot = {
      selectedProject: projectIri,
      selectedOntology: ontology,
      selectedResourceClass: state.selectedResourceClass,
      propertyFormList: state.propertyFormList,
      properties: state.properties,
      propertiesOrderBy: state.propertiesOrderBy,
      filteredProperties: state.filteredProperties,
    };

    const storedSearch = localStorage.getItem(this.STORAGE_KEY);
    const projectPreviousSearch: Record<string, AdvancedSearchStateSnapshot> = storedSearch
      ? JSON.parse(storedSearch)
      : {};
    projectPreviousSearch[snapshot.selectedProject] = snapshot;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projectPreviousSearch));
  }

  hasPreviousSearch(): boolean {
    return !!this.previousSearchObject.selectedOntology;
  }
}
