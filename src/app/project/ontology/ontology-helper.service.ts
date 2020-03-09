import { Injectable } from '@angular/core';

/**
 * Reusable methods for ontology editor
 */
@Injectable({
    providedIn: 'root'
})
export class OntologyHelperService {

    constructor() { }

    /**
     * Create a unique name (id) for resource classes or properties;
     * The name starts with the three first character of ontology iri to avoid a start with a number (which is not allowed)
     *
     * @param  {string} ontologyIri
     * @returns string
     */
    setUniqueName(ontologyIri: string): string {
        const name: string = this.getOntologyName(ontologyIri).substring(0, 3) + Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);

        return name;
    }

    /**
     * Get the ontolgoy name from ontology iri
     *
     * @param  {string} ontologyIri
     * @returns string
     */
    getOntologyName(ontologyIri: string): string {

        const array = ontologyIri.split('/');

        const pos = array.length - 2;

        return array[pos].toLowerCase();
    }


}
