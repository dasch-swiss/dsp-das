import { Inject, Injectable } from '@angular/core';
import {
    ApiResponseData,
    ApiResponseError,
    Constants,
    CountQueryResponse,
    KnoraApiConnection,
    ListNodeV2,
    OntologiesMetadata,
    OntologyMetadata,
    ProjectsResponse,
    ReadOntology,
    ReadResource,
    ReadResourceSequence,
    ResourceClassAndPropertyDefinitions,
    ResourceClassDefinition,
    ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';

export interface ApiData {
    iri: string;
    label: string;
}

export interface PropertyData {
    iri: string;
    label: string;
    objectType: string;
    isLinkProperty: boolean; // todo: should this be called linkProperty or linkedResource?
    listIri?: string; // only for list values
}

export interface GravsearchPropertyString {
    constructString: string;
    whereString: string;
}

export const ResourceLabel =
    Constants.KnoraApiV2 + Constants.HashDelimiter + 'ResourceLabel';

// I think this should be possible instead of importing it from an external library
// export const DspApiConnectionToken = new InjectionToken<KnoraApiConnection>(
//     'DSP api connection instance'
// );

@Injectable({
    providedIn: 'root',
})
export class AdvancedSearchService {
    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection
    ) {}

    // API call to get the list of ontologies
    allOntologiesList = (): Observable<ApiData[]> => {
        return this._dspApiConnection.v2.onto.getOntologiesMetadata().pipe(
            map((response: OntologiesMetadata | ApiResponseError) => {
                if (response instanceof ApiResponseError) {
                    throw response; // caught by catchError operator
                }
                return response.ontologies
                    .filter(
                        (onto: OntologyMetadata) =>
                            onto.attachedToProject !==
                            Constants.SystemProjectIRI
                    )
                    .map((onto: { id: string; label: string }) => {
                        return { iri: onto.id, label: onto.label };
                    });
            }),
            catchError((err) => {
                this._handleError(err);
                return []; // return an empty array on error
            })
        );
    };

    // API call to get the list of ontologies within the specified project iri
    ontologiesInProjectList = (projectIri: string): Observable<ApiData[]> => {
        return this._dspApiConnection.v2.onto
            .getOntologiesByProjectIri(projectIri)
            .pipe(
                map((response: OntologiesMetadata | ApiResponseError) => {
                    if (response instanceof ApiResponseError) {
                        throw response; // caught by catchError operator
                    }
                    return response.ontologies.map(
                        (onto: { id: string; label: string }) => {
                            return { iri: onto.id, label: onto.label };
                        }
                    );
                }),
                catchError((err) => {
                    this._handleError(err);
                    return []; // return an empty array on error
                })
            );
    };

    // API call to get the list of resource classes
    resourceClassesList = (ontologyIri: string): Observable<ApiData[]> => {
        return this._dspApiConnection.v2.onto.getOntology(ontologyIri).pipe(
            map((response: ApiResponseError | ReadOntology) => {
                if (response instanceof ApiResponseError) {
                    throw response; // caught by catchError operator
                }

                // todo: idk how to test subclasses so maybe this doesn't get them
                const resClasses = response.getClassDefinitionsByType(
                    ResourceClassDefinition
                );

                return resClasses
                    .sort(
                        (
                            a: ResourceClassDefinition,
                            b: ResourceClassDefinition
                        ) => (a.label || '').localeCompare(b.label || '')
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
    };

    // API call to get the list of properties
    propertiesList = (ontologyIri: string): Observable<PropertyData[]> => {
        return this._dspApiConnection.v2.ontologyCache
            .getOntology(ontologyIri)
            .pipe(
                map((onto: Map<string, ReadOntology>) => {
                    const ontology = onto.get(ontologyIri);

                    if (!ontology) return [];

                    const props = ontology
                        .getPropertyDefinitionsByType(
                            ResourcePropertyDefinition
                        )
                        .filter(
                            (propDef) =>
                                propDef.isEditable &&
                                !propDef.isLinkValueProperty
                        );

                    return props
                        .sort(
                            (
                                a: ResourcePropertyDefinition,
                                b: ResourcePropertyDefinition
                            ) => (a.label || '').localeCompare(b.label || '')
                        )
                        .map((propDef: ResourcePropertyDefinition) => {
                            // label can be undefined
                            const label = propDef.label || '';

                            // objectType can be undefined but I'm not really sure if this is true
                            const objectType = propDef.objectType || '';

                            const linkProperty = !propDef.objectType?.includes(
                                Constants.KnoraApiV2
                            );

                            return {
                                iri: propDef.id,
                                label: label,
                                objectType: objectType,
                                isLinkProperty: linkProperty,
                            };
                        });
                }),
                catchError((err) => {
                    this._handleError(err);
                    return []; // return an empty array on error
                })
            );
    };

    // API call to get the list of properties filtered by resource class
    filteredPropertiesList = (
        resourceClassIri: string
    ): Observable<PropertyData[]> => {
        return this._dspApiConnection.v2.ontologyCache
            .getResourceClassDefinition(resourceClassIri)
            .pipe(
                map((onto: ResourceClassAndPropertyDefinitions) => {
                    const props = onto
                        .getPropertyDefinitionsByType(
                            ResourcePropertyDefinition
                        )
                        .filter(
                            (propDef) =>
                                propDef.isEditable &&
                                !propDef.isLinkValueProperty
                        );

                    return props
                        .sort(
                            (
                                a: ResourcePropertyDefinition,
                                b: ResourcePropertyDefinition
                            ) => (a.label || '').localeCompare(b.label || '')
                        )
                        .map((propDef: ResourcePropertyDefinition) => {
                            // label can be undefined
                            const label = propDef.label || '';

                            // objectType can be undefined but I'm not really sure if this is true
                            const objectType = propDef.objectType || '';

                            const linkProperty = !propDef.objectType?.includes(
                                Constants.KnoraApiV2
                            );

                            if (objectType === Constants.ListValue) {
                                const guiAttr = propDef.guiAttributes;
                                if (
                                    guiAttr.length === 1 &&
                                    guiAttr[0].startsWith('hlist=')
                                ) {
                                    // get list node iri from gui attribute
                                    // i.e. hlist=<http://rdfh.ch/lists/0420/6-Vp0F_1TfSS-DS_9q-Ucw>
                                    const listNodeIri = guiAttr[0].substring(
                                        7,
                                        guiAttr[0].length - 1
                                    );
                                    return {
                                        iri: propDef.id,
                                        label: label,
                                        objectType: objectType,
                                        isLinkProperty: linkProperty,
                                        listIri: listNodeIri,
                                    };
                                } else {
                                    console.error(
                                        'No root node Iri given for property',
                                        guiAttr
                                    );
                                }
                            }

                            return {
                                iri: propDef.id,
                                label: label,
                                objectType: objectType,
                                isLinkProperty: linkProperty,
                            };
                        });
                }),
                catchError((err) => {
                    this._handleError(err);
                    return []; // return an empty array on error
                })
            );
    };

    resourcesList = (
        searchValue: string,
        resourceClassIri: string
    ): Observable<ApiData[]> => {
        return this._dspApiConnection.v2.search
            .doSearchByLabel(searchValue, 0, {
                limitToResourceClass: resourceClassIri,
            })
            .pipe(
                map((response: ReadResourceSequence | ApiResponseError) => {
                    if (response instanceof ApiResponseError) {
                        throw response; // caught by catchError operator
                    }
                    return response.resources.map((res: ReadResource) => {
                        return { iri: res.id, label: res.label };
                    });
                })
            );
    };

    getResourceListCount(
        searchValue: string,
        resourceClassIri: string
    ): Observable<number> {
        return this._dspApiConnection.v2.search
            .doSearchByLabelCountQuery(searchValue, {
                limitToResourceClass: resourceClassIri,
            })
            .pipe(
                map((response: CountQueryResponse | ApiResponseError) => {
                    if (response instanceof ApiResponseError) {
                        throw response; // caught by catchError operator
                    }
                    return response.numberOfResults;
                })
            );
    }

    getResourcesList(
        searchValue: string,
        resourceClassIri: string,
        offset = 0
    ): Observable<ApiData[]> {
        return this._dspApiConnection.v2.search
            .doSearchByLabel(searchValue, offset, {
                limitToResourceClass: resourceClassIri,
            })
            .pipe(
                map((response: ReadResourceSequence | ApiResponseError) => {
                    if (response instanceof ApiResponseError) {
                        throw response; // caught by catchError operator
                    }
                    return response.resources.map((res: ReadResource) => {
                        return { iri: res.id, label: res.label };
                    });
                }),
                catchError((err) => {
                    this._handleError(err);
                    return []; // return an empty array on error
                })
            );
    }

    getList(rootNodeIri: string): Observable<ListNodeV2> {
        return this._dspApiConnection.v2.list.getList(rootNodeIri).pipe(
            map((response: ListNodeV2 | ApiResponseError) => {
                if (response instanceof ApiResponseError) {
                    throw response; // caught by catchError operator
                }
                return response;
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
