import { Inject, Injectable } from '@angular/core';
import { ApiResponseError, KnoraApiConnection, OntologiesMetadata, ReadOntology, ResourceClassAndPropertyDefinitions, ResourceClassDefinition, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
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

    // API call to get the list of ontologies
    ontologiesList = (
        projectIri: string
    ): Observable<ApiData[]> => {
        return this._dspApiConnection.v2.onto.getOntologiesByProjectIri(projectIri).pipe(
          map((response: OntologiesMetadata | ApiResponseError) => {
                if(response instanceof ApiResponseError) {
                    throw response; // caught by catchError operator
                }
                return response.ontologies.map((onto: { id: string; label: string; }) => {
                    return {iri: onto.id, label: onto.label}
                });
            },
          ),
          catchError(err => {
            this._handleError(err);
            return [];  // return an empty array on error
          }),
        );
    }


    // API call to get the list of resource classes
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

    // API call to get the list of properties
    propertiesList = (
        ontologyIri: string
    ): Observable<ApiData[]> => {
        return this._dspApiConnection.v2.ontologyCache.getOntology(ontologyIri).pipe(
            map((onto: Map<string, ReadOntology>) => {
                const ontology = onto.get(ontologyIri);

                if(!ontology) return [];

                const props = ontology.getPropertyDefinitionsByType(ResourcePropertyDefinition)
                .filter(
                    (propDef) => propDef.isEditable && !propDef.isLinkValueProperty
                );

                return props
                .sort((a: ResourcePropertyDefinition, b: ResourcePropertyDefinition) =>
                    (a.label || '').localeCompare(b.label || '')
                )
                .map((propDef: ResourcePropertyDefinition) => {
                    // label can be undefined
                    const label = propDef.label || '';
                    return { iri: propDef.id, label: label };
                });
            }),
            catchError((err) => {
                this._handleError(err);
                return []; // return an empty array on error
            })
        )
    }

    // API call to get the list of properties filtered by resource class
    filteredPropertiesList = (
        resourceClassIri: string
    ): Observable<ApiData[]> => {
        return this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(resourceClassIri).pipe(
            map((onto: ResourceClassAndPropertyDefinitions) => {
                const props = onto.getPropertyDefinitionsByType(ResourcePropertyDefinition)
                .filter(
                    (propDef) => propDef.isEditable && !propDef.isLinkValueProperty
                );

                return props
                .sort((a: ResourcePropertyDefinition, b: ResourcePropertyDefinition) =>
                    (a.label || '').localeCompare(b.label || '')
                )
                .map((propDef: ResourcePropertyDefinition) => {
                    // label can be undefined
                    const label = propDef.label || '';
                    return { iri: propDef.id, label: label };
                });
            }),
            catchError((err) => {
                this._handleError(err);
                return []; // return an empty array on error
            })
        )
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
