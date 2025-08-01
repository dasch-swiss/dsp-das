import { Inject, Injectable } from '@angular/core';
import {
  Constants,
  KnoraApiConnection,
  ListNodeV2,
  ReadOntology,
  ResourceClassAndPropertyDefinitions,
  ResourceClassDefinition,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { OntologyV2ApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { catchError, map, Observable, of, Subject, takeUntil } from 'rxjs';

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

export const ResourceLabel = `${Constants.KnoraApiV2 + Constants.HashDelimiter}ResourceLabel`;

// objectType is manually set so that it uses the KnoraApiV2 string for boolean checks later
export const ResourceLabelObject = {
  iri: 'resourceLabel',
  label: 'Resource Label',
  objectType: ResourceLabel,
};

@Injectable({
  providedIn: 'root',
})
export class AdvancedSearchService {
  // subjects to handle canceling of previous search requests when searching for a linked resource
  private cancelPreviousCountRequest$ = new Subject<void>();
  private cancelPreviousSearchRequest$ = new Subject<void>();

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _ontologyV2Api: OntologyV2ApiService
  ) {}

  // API call to get the list of ontologies
  allOntologiesList = (): Observable<ApiData[]> =>
    this._ontologyV2Api
      .getMetadata()
      .pipe(
        map(response =>
          response['@graph']
            .filter(onto => onto['knora-api:attachedToProject'] !== Constants.SystemProjectIRI)
            .map(onto => ({ iri: onto['@id'], label: onto['rdfs:label'] }))
        )
      );

  // API call to get the list of ontologies within the specified project iri
  ontologiesInProjectList = (projectIri: string): Observable<ApiData[]> =>
    this._dspApiConnection.v2.onto.getOntologiesByProjectIri(projectIri).pipe(
      map(response => {
        return response.ontologies.map((onto: { id: string; label: string }) => ({
          iri: onto.id,
          label: onto.label,
        }));
      }),
      catchError(err => {
        return []; // return an empty array on error
      })
    );

  // API call to get the list of resource classes
  resourceClassesList = (ontologyIri: string, restrictToClass?: string): Observable<ApiData[]> =>
    this._dspApiConnection.v2.onto.getOntology(ontologyIri).pipe(
      map(response => {
        let resClasses = response.getClassDefinitionsByType(ResourceClassDefinition);

        let resClassesFiltered: ResourceClassDefinition[] = [];

        // filter the list of resource classes by the restrictToClass parameter
        if (restrictToClass) {
          resClassesFiltered = resClasses.filter(
            (resClassDef: ResourceClassDefinition) => resClassDef.id === restrictToClass
          );
          const subclasses = resClasses.filter(
            (resClassDef: ResourceClassDefinition) => resClassDef.subClassOf.indexOf(restrictToClass) > -1
          );

          resClassesFiltered = resClassesFiltered.concat(subclasses);
        }

        if (resClassesFiltered.length) {
          resClasses = resClassesFiltered;
        }

        return resClasses
          .sort((a: ResourceClassDefinition, b: ResourceClassDefinition) =>
            (a.label || '').localeCompare(b.label || '')
          )
          .map((resClassDef: ResourceClassDefinition) => {
            // label can be undefined
            const label = resClassDef.label || '';
            return { iri: resClassDef.id, label };
          });
      }),
      catchError(err => {
        return []; // return an empty array on error
      })
    );

  // API call to get the list of properties
  propertiesList = (ontologyIri: string): Observable<PropertyData[]> =>
    this._dspApiConnection.v2.ontologyCache.getOntology(ontologyIri).pipe(
      map((onto: Map<string, ReadOntology>) => {
        const ontology = onto.get(ontologyIri);

        if (!ontology) return [];

        // get props and filter out properties that shouldn't be able to be selected
        const props = ontology
          .getPropertyDefinitionsByType(ResourcePropertyDefinition)
          .filter(propDef => propDef.isEditable && !propDef.isLinkValueProperty);

        return props
          .sort((a: ResourcePropertyDefinition, b: ResourcePropertyDefinition) =>
            (a.label || '').localeCompare(b.label || '')
          )
          .map((propDef: ResourcePropertyDefinition) => {
            // label can be undefined
            const label = propDef.label || '';

            // objectType can be undefined but it really never should be
            const objectType = propDef.objectType || '';

            const linkProperty = !propDef.objectType?.includes(Constants.KnoraApiV2);

            if (objectType === Constants.ListValue) {
              const guiAttr = propDef.guiAttributes;
              if (guiAttr.length === 1 && guiAttr[0].startsWith('hlist=')) {
                // get list node iri from gui attribute
                // i.e. hlist=<http://rdfh.ch/lists/0420/6-Vp0F_1TfSS-DS_9q-Ucw>
                const listNodeIri = guiAttr[0].substring(7, guiAttr[0].length - 1);
                return {
                  iri: propDef.id,
                  label,
                  objectType,
                  isLinkedResourceProperty: linkProperty,
                  listIri: listNodeIri,
                };
              } else {
                console.error('No root node Iri given for property', guiAttr);
              }
            }

            return {
              iri: propDef.id,
              label,
              objectType,
              isLinkedResourceProperty: linkProperty,
            };
          });
      }),
      catchError(err => {
        return []; // return an empty array on error
      })
    );

  // API call to get the list of properties filtered by resource class
  filteredPropertiesList = (resourceClassIri: string): Observable<PropertyData[]> =>
    this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(resourceClassIri).pipe(
      map(onto => {
        // filter out properties that shouldn't be able to be selected
        // this is a bit different than how the propertiesList method does it
        // because the getResourceClassDefintion method return more props
        // that should be filtered out
        const props = this._filterProperties(onto);

        return props
          .sort((a: ResourcePropertyDefinition, b: ResourcePropertyDefinition) =>
            (a.label || '').localeCompare(b.label || '')
          )
          .map(propDef => {
            // label can be undefined
            const label = propDef.label || '';

            // objectType can be undefined
            const objectType = propDef.objectType || '';

            const linkProperty = !propDef.objectType?.includes(Constants.KnoraApiV2);

            if (objectType === Constants.ListValue) {
              const guiAttr = propDef.guiAttributes;
              if (guiAttr.length === 1 && guiAttr[0].startsWith('hlist=')) {
                // get list node iri from gui attribute
                // i.e. hlist=<http://rdfh.ch/lists/0420/6-Vp0F_1TfSS-DS_9q-Ucw>
                const listNodeIri = guiAttr[0].substring(7, guiAttr[0].length - 1);
                return {
                  iri: propDef.id,
                  label,
                  objectType,
                  isLinkedResourceProperty: linkProperty,
                  listIri: listNodeIri,
                };
              } else {
                console.error('No root node Iri given for property', guiAttr);
              }
            }

            return {
              iri: propDef.id,
              label,
              objectType,
              isLinkedResourceProperty: linkProperty,
            };
          });
      }),
      catchError(err => {
        return []; // return an empty array on error
      })
    );

  getResourcesListCount(searchValue: string, resourceClassIri: string): Observable<number> {
    // Cancel the previous count request
    this.cancelPreviousCountRequest$.next();

    if (!searchValue || searchValue.length <= 2 || typeof searchValue !== 'string') return of(0);

    return this._dspApiConnection.v2.search
      .doSearchByLabelCountQuery(searchValue, {
        limitToResourceClass: resourceClassIri,
      })
      .pipe(
        takeUntil(this.cancelPreviousCountRequest$), // Cancel previous request
        map(response => response.numberOfResults),
        catchError(err => {
          return of(0); // return 0 on error
        })
      );
  }

  getResourcesList(searchValue: string, resourceClassIri: string, offset = 0): Observable<ApiData[]> {
    // Cancel the previous search request
    this.cancelPreviousSearchRequest$.next();

    if (!searchValue || searchValue.length <= 2) return of([]);

    return this._dspApiConnection.v2.search
      .doSearchByLabel(searchValue, offset, {
        limitToResourceClass: resourceClassIri,
      })
      .pipe(
        takeUntil(this.cancelPreviousSearchRequest$), // Cancel previous request
        map(response =>
          response.resources.map(res => ({
            iri: res.id,
            label: res.label,
          }))
        ),
        catchError(err => {
          return of([]); // return an empty array on error wrapped in an observable
        })
      );
  }

  getList(rootNodeIri: string): Observable<ListNodeV2 | undefined> {
    return this._dspApiConnection.v2.list.getList(rootNodeIri).pipe(
      catchError(err => {
        return of(undefined);
      })
    );
  }

  private _filterProperties(resPropDefs: ResourceClassAndPropertyDefinitions): ResourcePropertyDefinition[] {
    return resPropDefs
      .getPropertyDefinitionsByType(ResourcePropertyDefinition)
      .filter(
        propDef =>
          propDef.isEditable &&
          !propDef.isLinkValueProperty &&
          propDef.objectType !== Constants.AudioFileValue &&
          propDef.objectType !== Constants.DDDFileValue &&
          propDef.objectType !== Constants.DocumentFileValue &&
          propDef.objectType !== Constants.MovingImageFileValue &&
          propDef.objectType !== Constants.StillImageFileValue &&
          propDef.objectType !== Constants.StillImageExternalFileValue &&
          propDef.objectType !== Constants.StillImageAbstractFileValue &&
          propDef.objectType !== Constants.ArchiveFileValue &&
          propDef.objectType !== Constants.TextFileValue
      );
  }
}
