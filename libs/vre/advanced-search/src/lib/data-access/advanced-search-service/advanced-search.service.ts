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
import { Operators, OrderByItem, PropertyFormItem } from '../advanced-search-store/advanced-search-store.service';

export interface ApiData {
    iri: string;
    label: string;
}

// maybe we can combine this with ApiData
// objectType can be undefined anyways so we can just make it optional
export interface PropertyData {
    iri: string;
    label: string;
    objectType: string;
    listIri?: string; // only for list values
}

export interface GravsearchPropertyString {
    linkString: string;
    valueString?: string;
}

@Injectable({
    providedIn: 'root',
})
export class AdvancedSearchService {
    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection
    ) {}

    // API call to get the list of projects
    projectsList = (): Observable<ApiData[]> => {
        return this._dspApiConnection.admin.projectsEndpoint.getProjects().pipe(
            map(
                (
                    response:
                        | ApiResponseData<ProjectsResponse>
                        | ApiResponseError
                ) => {
                    if (response instanceof ApiResponseError) {
                        throw response; // caught by catchError operator
                    }
                    return response.body.projects.map(
                        (proj: { id: string; shortname: string }) => {
                            return { iri: proj.id, label: proj.shortname };
                        }
                    );
                }
            ),
            catchError((err) => {
                this._handleError(err);
                return []; // return an empty array on error
            })
        );
    };

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

                            return {
                                iri: propDef.id,
                                label: label,
                                objectType: objectType,
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

    generateGravSearchQuery(
        resourceClassIri: string | undefined,
        properties: PropertyFormItem[],
        orderByList: OrderByItem[]
    ): string {
        // class restriction for the resource searched for
        let restrictToResourceClass = '';

        // if given, create the class restriction for the main resource
        if (resourceClassIri !== undefined) {
            restrictToResourceClass = `?mainRes a <${resourceClassIri}> .`;
        }

        const propertyStrings: GravsearchPropertyString[] = properties.map((prop, index) => this._propertyStringHelper(prop, index));

        let orderByString = '';
        const orderByProps: string[] = [];

        // use the id in the orderByList to loop through properties to find the index of the property in the properties list
        // then add the string with the index to orderByProps
        orderByList
        .filter((orderByItem) => orderByItem.orderBy === true)
        .forEach((orderByItem) => {
            const index = properties.findIndex((prop) => prop.id === orderByItem.id);
            if (index > -1) {
                if(properties[index].selectedProperty?.objectType === Constants.Label) {
                    orderByProps.push('?label');
                } else {
                    orderByProps.push(`?prop${index}`);
                }

            }
        });

        orderByString = orderByProps.length ? `ORDER BY ${orderByProps.join(' ')}` : '';

        const gravSearch = `
            PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>
            CONSTRUCT {
                ?mainRes knora-api:isMainResource true .
                ${propertyStrings.map((prop) => prop.linkString).join('\n')}

            } WHERE {
            ?mainRes a knora-api:Resource .

            ${restrictToResourceClass}

            ${propertyStrings.map((prop) => prop.linkString).join('\n')}

            ${propertyStrings.map((prop) => prop.valueString).join('\n')}
            }

            ${orderByString}

            OFFSET 0
        `;

        console.log('gravSearch: ', gravSearch);

        return gravSearch;
    }

    private _propertyStringHelper(property: PropertyFormItem, index: number): GravsearchPropertyString {
        let linkString = '';
        let valueString = '';
        // add ResourceLabel to js-lib Constants with this structure
        // Constants.KnoraApiV2 + Constants.HashDelimiter + "resourceLabel";
        // so that we don't need to do this label check
        if(property.selectedProperty?.objectType !== Constants.Label &&
            property.selectedProperty?.objectType.includes(Constants.KnoraApiV2)) {
            linkString = '?mainRes <' + property.selectedProperty?.iri + '> ?prop' + index + ' .';
        }
        if (!(property.selectedOperator === 'exists' || property.selectedOperator === 'notExists')) {
            valueString = this._valueStringHelper(property, index);
        }
        return { linkString: linkString, valueString: valueString };
    }

    private _valueStringHelper(property: PropertyFormItem, index: number): string {
        if(property.selectedProperty?.objectType !== Constants.Label &&
            !property.selectedProperty?.objectType.includes(Constants.KnoraApiV2)) {
            switch (property.selectedOperator) {
                case Operators.Equals:
                    return `?mainRes <${property.selectedProperty?.iri}> <${property.searchValue}> .`
                case Operators.NotEquals:
                    return `FILTER NOT EXISTS { \n
                    ?mainRes <${property.selectedProperty?.iri}> <${property.searchValue}> . }`
                default:
                    throw new Error('Invalid operator for linked resource');
            }
        } else {
            switch (property.selectedProperty?.objectType) {
                case Constants.Label:
                    switch (property.selectedOperator) {
                        case Operators.Equals:
                        case Operators.NotEquals:
                            return `?mainRes rdfs:label ?label .\n
                            FILTER (?label ${this._operatorToSymbol(property.selectedOperator)} "${property.searchValue}") .`;
                        case Operators.IsLike:
                            return `?mainRes rdfs:label ?label .\n
                            FILTER regex(?label, "${property.searchValue}", "i") .`;
                        case Operators.Matches:
                            return `?mainRes rdfs:label ?label .\n
                            FILTER knora-api:matchLabel(?mainRes, "${property.searchValue}") .`
                        default:
                            throw new Error('Invalid operator for resource label');
                    }
                case Constants.TextValue:
                    switch (property.selectedOperator) {
                        case Operators.Equals:
                        case Operators.NotEquals:
                            return `?prop${index} <${Constants.ValueAsString}> ?prop${index}Literal .\n
                            FILTER (?prop${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${property.searchValue}"^^<${Constants.XsdString}>) .`;
                        case Operators.IsLike:
                            return `?prop${index} <${Constants.ValueAsString}> ?prop${index}Literal .\n
                            FILTER ${this._operatorToSymbol(property.selectedOperator)}(?prop${index}Literal, "${property.searchValue}"^^<${Constants.XsdString}>, "i") .`;
                        case Operators.Matches:
                            return `FILTER <${this._operatorToSymbol(property.selectedOperator)}>(?prop${index}, "${property.searchValue}"^^<${Constants.XsdString}>) .`;
                        default:
                            throw new Error('Invalid operator for text value');
                    }
                case Constants.IntValue:
                    return `?prop${index} <${Constants.IntValueAsInt}> ?prop${index}Literal .\n
                    FILTER (?prop${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${property.searchValue}"^^<${Constants.XsdInteger}>) .`;
                case Constants.DecimalValue:
                    return `?prop${index} <${Constants.DecimalValueAsDecimal}> ?prop${index}Literal .\n
                    FILTER (?prop${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${property.searchValue}"^^<${Constants.XsdDecimal}>) .`;
                case Constants.BooleanValue:
                    return `?prop${index} <${Constants.BooleanValueAsBoolean}> ?prop${index}Literal .\n
                    FILTER (?prop${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${property.searchValue}"^^<${Constants.XsdBoolean}>) .`;
                case Constants.DateValue:
                    return `FILTER(knora-api:toSimpleDate(?prop${index}) ${this._operatorToSymbol(property.selectedOperator)} "${property.searchValue}"^^<${Constants.KnoraApi}/ontology/knora-api/simple/v2${Constants.HashDelimiter}Date>) .`;
                case Constants.ListValue:
                    return `?prop${index} <${Constants.ListValueAsListNode}> <${property.searchValue}> .\n`;
                case Constants.UriValue:
                    return `?prop${index} <${Constants.UriValueAsUri}> ?prop${index}Literal .\n
                    FILTER (?prop${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${property.searchValue}"^^<${Constants.XsdAnyUri}>) .`
                default:
                    throw new Error('Invalid object type');
            }
        }
    }

    private _operatorToSymbol(operator: string | undefined): string {
        switch (operator) {
            case Operators.Equals:
                return '=';
            case Operators.NotEquals:
                return '!=';
            case Operators.GreaterThan:
                return '>';
            case Operators.GreaterThanEquals:
                return '>=';
            case Operators.LessThan:
                return '<';
            case Operators.LessThanEquals:
                return '<=';
            case Operators.Exists:
                return 'E';
            case Operators.NotExists:
                return '!E';
            case Operators.IsLike:
                return 'regex';
            case Operators.Matches:
                return Constants.MatchText;
            default:
                return '';
        }
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
