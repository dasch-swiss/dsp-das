import { Inject, Injectable } from '@angular/core';
import {
  Constants,
  KnoraApiConnection,
  ListNodeV2,
  ReadOntology,
  ResourceClassDefinitionWithAllLanguages,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { BehaviorSubject, catchError, filter, map, Observable, of, Subject, take, takeUntil, tap } from 'rxjs';
import { ApiData, PropertyData, ResourceLabelPropertyData } from '../model';

@Injectable()
export class AdvancedSearchDataService {
  // subjects to handle canceling of previous search requests when searching for a linked resource
  private cancelPreviousCountRequest$ = new Subject<void>();
  private cancelPreviousSearchRequest$ = new Subject<void>();

  private _ontologies = new BehaviorSubject<ApiData[]>([]);
  ontologies$ = this._ontologies.asObservable();

  private _selectedOntology = new BehaviorSubject<ReadOntology | null>(null);
  selectedOntology$ = this._selectedOntology.asObservable();

  get selectedOntology(): ApiData {
    return this._selectedOntology.value
      ? { iri: this._selectedOntology.value.id, label: this._selectedOntology.value.label || '' }
      : ({} as ApiData);
  }

  get classIris(): string[] {
    const ontology = this._selectedOntology.value;
    if (!ontology) {
      return [];
    }
    return ontology.getClassDefinitionsByType(ResourceClassDefinitionWithAllLanguages).map(c => c.id);
  }

  private _selectedResourceClass = new BehaviorSubject<ApiData | null>(null);
  selectedResourceClass$ = this._selectedResourceClass.asObservable();

  private _availableProperties = new BehaviorSubject<PropertyData[]>([]);
  availableProperties$ = this._availableProperties.asObservable();

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  initWithProject$(projectIri: string) {
    this._dspApiConnection.v2.onto
      .getOntologiesByProjectIri(projectIri)
      .pipe(map(r => r.ontologies.map(o => ({ iri: o.id, label: o.label }))))
      .subscribe({
        next: ontologies => {
          this._ontologies.next(ontologies);
          if (ontologies.length > 0) {
            this.setOntology(ontologies[0].iri);
          }
        },
      });
  }

  setOntology(ontologyIri: string) {
    this._selectedResourceClass.next(null);
    this._dspApiConnection.v2.onto.getOntology(ontologyIri, true).subscribe({
      next: ontology => this._selectedOntology.next(ontology),
    });
  }

  setSelectedResourceClass(resourceClass: ApiData | null) {
    this._selectedResourceClass.next(resourceClass);
    this._setAvailableProperties(resourceClass?.iri);
  }

  private _resourceClasses$ = this.selectedOntology$.pipe(
    filter((o): o is ReadOntology => o !== null),
    map(o => o.getClassDefinitionsByType(ResourceClassDefinitionWithAllLanguages)),
    map(xs =>
      [...xs].sort((a: ResourceClassDefinitionWithAllLanguages, b: ResourceClassDefinitionWithAllLanguages) =>
        (a.label || '').localeCompare(b.label || '')
      )
    )
  );

  private _properties$: Observable<ResourcePropertyDefinition[]> = this.selectedOntology$.pipe(
    filter((o): o is ReadOntology => o !== null),
    map(o => o.getPropertyDefinitionsByType(ResourcePropertyDefinition)),
    map(props => props.filter(propDef => propDef.isEditable && !propDef.isLinkValueProperty)),
    map(xs =>
      [...xs].sort((a: ResourcePropertyDefinition, b: ResourcePropertyDefinition) =>
        (a.label || '').localeCompare(b.label || '')
      )
    )
  );

  resourceClasses$: Observable<ApiData[]> = this._resourceClasses$.pipe(
    map(resClasses =>
      resClasses.map((resClassDef: ResourceClassDefinitionWithAllLanguages) => {
        return { iri: resClassDef.id, label: resClassDef.label || '' };
      })
    )
  );

  private _setAvailableProperties(classIri?: string): void {
    const props$ =
      !classIri || classIri === 'all-resource-classes'
        ? this._properties$.pipe(map(props => [ResourceLabelPropertyData, ...props.map(this._createPropertyData)]))
        : this._getPropertiesOfResourceClass$(classIri);
    props$.subscribe(props => {
      this._availableProperties.next(props);
    });
  }

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
