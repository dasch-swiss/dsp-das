import { Inject, Injectable } from '@angular/core';
import {
    ApiResponseError,
    Constants,
    CountQueryResponse,
    KnoraApiConnection,
    ListNodeV2,
    OntologiesMetadata,
    OntologyMetadata,
    ReadOntology,
    ReadResource,
    ReadResourceSequence,
    ResourceClassAndPropertyDefinitions,
    ResourceClassDefinition,
    ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';

export interface ApiData {
    iri: string;
    label: string;
}

export interface PropertyData {
    iri: string;
    label: string;
    objectType: string;
    isLinkedResourceProperty: boolean;
    listIri?: string; // only for list values
}

export interface GravsearchPropertyString {
    constructString: string;
    whereString: string;
}

export const ResourceLabel =
    Constants.KnoraApiV2 + Constants.HashDelimiter + 'ResourceLabel';

// objectType is manually set so that it uses the KnoraApiV2 string for boolean checks later
export const ResourceLabelObject = { iri: 'resourceLabel', label: 'Resource Label', objectType: ResourceLabel};

@Injectable({
    providedIn: 'root',
})
export class AdvancedSearchService {
    // subjects to handle canceling of previous search requests when searching for a linked resource
    private cancelPreviousCountRequest$ = new Subject<void>();
    private cancelPreviousSearchRequest$ = new Subject<void>();

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
                                        isLinkedResourceProperty: linkProperty,
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
                                isLinkedResourceProperty: linkProperty,
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

                            // objectType can be undefined
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
                                        isLinkedResourceProperty: linkProperty,
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
                                isLinkedResourceProperty: linkProperty,
                            };
                        });
                }),
                catchError((err) => {
                    this._handleError(err);
                    return []; // return an empty array on error
                })
            );
    };

    getResourcesListCount(
        searchValue: string,
        resourceClassIri: string
    ): Observable<number> {
        // Cancel the previous count request
        this.cancelPreviousCountRequest$.next();

        if(!searchValue || searchValue.length <= 2)
            return of(0);

        return this._dspApiConnection.v2.search
            .doSearchByLabelCountQuery(searchValue, {
                limitToResourceClass: resourceClassIri,
            })
            .pipe(
                takeUntil(this.cancelPreviousCountRequest$), // Cancel previous request
                switchMap((response: CountQueryResponse | ApiResponseError) => {
                    if (response instanceof ApiResponseError) {
                        throw response; // caught by catchError operator
                    }
                    return of(response.numberOfResults);
                }),
                catchError((err) => {
                    this._handleError(err);
                    return of(0); // return 0 on error
                })
            );
    }

    getResourcesList(
        searchValue: string,
        resourceClassIri: string,
        offset = 0
    ): Observable<ApiData[]> {
        // Cancel the previous search request
        this.cancelPreviousSearchRequest$.next();

        if(!searchValue || searchValue.length <= 2)
            return of([]);

        return this._dspApiConnection.v2.search
            .doSearchByLabel(searchValue, offset, {
                limitToResourceClass: resourceClassIri,
            })
            .pipe(
                takeUntil(this.cancelPreviousSearchRequest$), // Cancel previous request
                switchMap(
                    (response: ReadResourceSequence | ApiResponseError) => {
                        if (response instanceof ApiResponseError) {
                            throw response; // caught by catchError operator
                        }
                        return of(
                            response.resources.map((res: ReadResource) => ({
                                iri: res.id,
                                label: res.label,
                            }))
                        );
                    }
                ),
                catchError((err) => {
                    this._handleError(err);
                    return of([]); // return an empty array on error wrapped in an observable
                })
            );
    }

    getList(rootNodeIri: string): Observable<ListNodeV2 | undefined> {
        return this._dspApiConnection.v2.list.getList(rootNodeIri).pipe(
            map((response: ListNodeV2 | ApiResponseError) => {
                if (response instanceof ApiResponseError) {
                    throw response; // caught by catchError operator
                }
                return response;
            }),
            catchError((err) => {
                this._handleError(err);
                return of(undefined); // return undefined on error
            })
        );
    }

    private _handleError(error: unknown) {
        if (error instanceof ApiResponseError) {
            console.error('API error: ', error);
        } else {
            console.error('An error occurred: ', error);
        }
    }
}
