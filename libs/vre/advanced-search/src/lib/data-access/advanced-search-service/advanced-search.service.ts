import { Inject, Injectable } from '@angular/core';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, OntologiesMetadata, ProjectResponse } from '@dasch-swiss/dsp-js';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
            (error: ApiResponseError) => console.error(error)
          ),
        //   catchError(err => {
        //     console.error(err);
        //     return of([]);  // Return an empty array on error.
        //   }),
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
                        console.log('resClass:', resClass);
                        return {iri: resClass.id, label: resClass.label}
                })},
                (error: ApiResponseError) => console.error(error)
            ),
        );

    }

}
