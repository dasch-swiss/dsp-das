import { Inject, Injectable } from '@angular/core';
import { ApiResponseError, KnoraApiConnection, ReadOntology, ResourceClassDefinition } from '@dasch-swiss/dsp-js';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';

export interface ApiData {
    iri: string
    label: string
}

@Injectable({
    providedIn: 'root',
})
export class AdvancedSearchService {

    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection
    ) {}

    ontologiesList = (
        projectIri: string
    ): Observable<ApiData[]> => {
        return this._dspApiConnection.v2.onto.getOntologiesByProjectIri(projectIri).pipe(
          map(
            // todo: type this
            (data: any) => {
                console.log('onto:', data);
                return data.ontologies.map((onto: { id: string; label: string; }) => {return {iri: onto.id, label: onto.label}})
            },
          ),
          catchError(err => {
            this._handleError(err);
            return [];  // return an empty array on error
          }),
        );
    }

    resourceClassesList = (
        ontologyIri: string
    ): Observable<ApiData[]> => {
        return this._dspApiConnection.v2.onto.getOntology(ontologyIri).pipe(
            map((response: ApiResponseError | ReadOntology) => {
                if (response instanceof ApiResponseError) {
                  throw response; // caught by catchError operator
                }
                // todo: idk how to test subclasses so maybe this doesn't get them
                const resClasses = response.getClassDefinitionsByType(ResourceClassDefinition);
                return resClasses
                .sort((a: ResourceClassDefinition, b: ResourceClassDefinition) =>
                    (a.label || '').localeCompare(b.label || '')
                )
                .map((resClassDef: ResourceClassDefinition) => {
                  // label can be undefined
                  const label = resClassDef.label || '';
                  return { iri: resClassDef.id, label: label };
                });
              }),
              catchError((err) => {
                this._handleError(err);
                return []; // return an empty array on error
              })
        );
    }

    // todo: check if we can type this
    private _handleError(error: any) {
        if (error instanceof ApiResponseError) {
            console.error('API error: ', error);
        } else {
            console.error('An error occurred: ', error);
        }
    }

}
