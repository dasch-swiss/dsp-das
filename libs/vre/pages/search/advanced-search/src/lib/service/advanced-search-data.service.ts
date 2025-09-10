import { Inject, Injectable } from '@angular/core';
import {
  Constants,
  KnoraApiConnection,
  ListNodeV2,
  ReadOntology,
  ResourceClassDefinition,
  ResourceClassDefinitionWithAllLanguages,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import {
  BehaviorSubject,
  catchError,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { ApiData, PropertyData, ResourceLabelPropertyData } from '../model';

@Injectable()
export class AdvancedSearchDataService {
  // subjects to handle canceling of previous search requests when searching for a linked resource
  private cancelPreviousCountRequest$ = new Subject<void>();
  private cancelPreviousSearchRequest$ = new Subject<void>();

  private _currentOntology = new BehaviorSubject<ReadOntology | null>(null);
  currentOntology$ = this._currentOntology.asObservable();

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  ontologies$ = (projectIri: string): Observable<ApiData[]> =>
    this._dspApiConnection.v2.onto.getOntologiesByProjectIri(projectIri).pipe(
      map(response => {
        return response.ontologies.map((onto: { id: string; label: string }) => ({
          iri: onto.id,
          label: onto.label,
        }));
      })
    );

  initWithOntology(ontologyIri: string) {
    this._dspApiConnection.v2.onto
      .getOntology(ontologyIri, true)
      .pipe(
        take(1),
        tap(ontology => {
          this._currentOntology.next(ontology);
        })
      )
      .subscribe();
  }

  private _resourceClasses$ = this.currentOntology$.pipe(
    filter((o): o is ReadOntology => o !== null),
    map(o => o.getClassDefinitionsByType(ResourceClassDefinitionWithAllLanguages)),
    map(xs =>
      [...xs].sort((a: ResourceClassDefinitionWithAllLanguages, b: ResourceClassDefinitionWithAllLanguages) =>
        (a.label || '').localeCompare(b.label || '')
      )
    )
  );

  private _properties$: Observable<ResourcePropertyDefinition[]> = this.currentOntology$.pipe(
    filter((o): o is ReadOntology => o !== null),
    map(o => o.getPropertyDefinitionsByType(ResourcePropertyDefinition)),
    map(props => props.filter(propDef => propDef.isEditable && !propDef.isLinkValueProperty)),
    map(xs =>
      [...xs].sort((a: ResourcePropertyDefinition, b: ResourcePropertyDefinition) =>
        (a.label || '').localeCompare(b.label || '')
      )
    )
  );

  resourceClassesList$: Observable<ApiData[]> = this._resourceClasses$.pipe(
    map(resClasses =>
      resClasses.map((resClassDef: ResourceClassDefinitionWithAllLanguages) => {
        return { iri: resClassDef.id, label: resClassDef.label || '' };
      })
    )
  );

  getProperties$ = (classIri?: string): Observable<PropertyData[]> =>
    !classIri || classIri === 'all-resource-classes'
      ? this._properties$.pipe(map(props => [ResourceLabelPropertyData, ...props.map(this._createPropertyData)]))
      : this._getPropertiesOfResourceClass$(classIri);

  private _getPropertiesOfResourceClass$ = (classIri: string): Observable<PropertyData[]> =>
    this._properties$.pipe(map(props => props.filter(p => p.subjectType === classIri).map(this._createPropertyData)));

  getSubclassesOfResourceClass$ = (classIri: string): Observable<ApiData[]> =>
    this._resourceClasses$.pipe(
      map(resClasses =>
        resClasses.filter(r => r.subClassOf.includes(classIri)).map(r => ({ iri: r.id, label: r.label || '' }))
      )
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

  private _createPropertyData(propDef: ResourcePropertyDefinition): PropertyData {
    const propertyData: PropertyData = {
      iri: propDef.id,
      label: propDef.label || '',
      objectType: propDef.objectType || '',
      isLinkedResourceProperty: propDef.isLinkProperty,
    };

    if (
      propDef.objectType === Constants.ListValue &&
      propDef.guiAttributes.length === 1 &&
      propDef.guiAttributes[0].startsWith('hlist=')
    ) {
      const listNodeIri = propDef.guiAttributes[0].substring(7, propDef.guiAttributes[0].length - 1);
      propertyData.listIri = listNodeIri;
    }
    return propertyData;
  }
}
