import { Inject, Injectable } from '@angular/core';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, OntologiesMetadata, ProjectResponse } from '@dasch-swiss/dsp-js';
import { inject } from '@angular/core';
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
            // type this
            (data: any) => data.ontologies.map((onto: { id: string; label: string; }) => {return {iri: onto.id, label: onto.label}}),
          ),
          catchError(err => {
            this._handleError(err);
            return [];  // Return an empty array on error.
          }),
        );
    }

    resourceClassesList = (
        ontologyIri: string
    ): Observable<ApiData[]> => {
        return this._dspApiConnection.v2.onto.getOntology(ontologyIri).pipe(
            map(
                (data: any) => {
                    console.log('data:', data);
                    return Object.keys(data.classes).map((key) => {
                        const resClass = data.classes[key];
                        return {iri: resClass.id, label: resClass.label}
                })}
            ),
            catchError(err => {
                this._handleError(err);
                return [];  // Return an empty array on error.
            }),
        );
    }

    private _handleError(error: any) {
        if (error instanceof ApiResponseError) {
            console.error('API error: ', error);
        } else {
            console.error('An error occurred: ', error);
        }
    }

}
