import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';

export interface AdvancedSearchState {
    ontologies: string[];
    resourceClasses: string[];
    selectedOntology: string | undefined;
    selectedResourceClass: string | undefined;
}

@Injectable()
export class AdvancedSearchStoreService extends ComponentStore<AdvancedSearchState> {

    ontologies$: Observable<string[]> = this.select((state) => state.ontologies);
    resourceClasses$: Observable<string[]> = this.select((state) => state.resourceClasses);
    selectedOntology$: Observable<string | undefined> = this.select((state) => state.selectedOntology);
    selectedResourceClass$: Observable<string | undefined> = this.select((state) => state.selectedResourceClass);

    /** combined selectors */

    // search button is disabled if no ontology and no resource class are selected
    searchButtonDisabled$: Observable<boolean> = this.select(
        this.selectedOntology$,
        this.selectedResourceClass$,
        (ontology, resourceClass) => !(ontology && resourceClass)
    );

    updateSelectedOntology(ontology: string): void {
        this.patchState({ selectedOntology: ontology });
    }

    updateSelectedResourceClass(resourceClass: string): void {
        this.patchState({ selectedResourceClass: resourceClass });
    }
}
