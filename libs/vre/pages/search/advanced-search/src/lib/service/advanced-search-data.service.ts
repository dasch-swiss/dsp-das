import { Inject, Injectable } from '@angular/core';
import {
  Constants,
  KnoraApiConnection,
  ReadOntology,
  ResourceClassDefinitionWithAllLanguages,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { ApiData, PropertyData, ResourceLabelPropertyData } from '../model';

@Injectable()
export class AdvancedSearchDataService {
  private _ontologies = new BehaviorSubject<ApiData[]>([]);
  ontologies$ = this._ontologies.asObservable();

  private _selectedOntology = new BehaviorSubject<ReadOntology | null>(null);
  selectedOntology$ = this._selectedOntology.asObservable();

  private _ontologyLoading = new BehaviorSubject<boolean>(true);
  ontologyLoading$ = this._ontologyLoading.asObservable();

  private _selectedResourceClass = new BehaviorSubject<ApiData | undefined>(undefined);
  selectedResourceClass$ = this._selectedResourceClass.asObservable();

  private _availableProperties = new BehaviorSubject<PropertyData[]>([]);
  availableProperties$ = this._availableProperties.asObservable();

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  init(projectIri: string, ontology?: ApiData, resourceClass?: ApiData) {
    this._dspApiConnection.v2.onto
      .getOntologiesByProjectIri(projectIri)
      .pipe(map(r => r.ontologies.map(o => ({ iri: o.id, label: o.label }))))
      .subscribe({
        next: ontologies => {
          this._ontologies.next(ontologies);
          if (ontologies.length > 0) {
            const selectedIri = ontology?.iri || ontologies[0].iri;
            this.setOntology(selectedIri, resourceClass);
          }
        },
      });
  }

  setOntology(ontologyIri: string, resourceClass?: ApiData) {
    this._ontologyLoading.next(true);
    this._dspApiConnection.v2.onto.getOntology(ontologyIri, true).subscribe({
      next: ontology => {
        this._selectedOntology.next(ontology);
        this._ontologyLoading.next(false);
        this.setSelectedResourceClass(resourceClass);
      },
    });
  }

  setSelectedResourceClass(resourceClass?: ApiData) {
    this._selectedResourceClass.next(resourceClass);
    this._setAvailableProperties(resourceClass?.iri);
  }

  private _resourceClassDefinitions$ = this.selectedOntology$.pipe(
    filter((o): o is ReadOntology => o !== null),
    map(o => o.getClassDefinitionsByType(ResourceClassDefinitionWithAllLanguages)),
    map(xs =>
      [...xs].sort((a: ResourceClassDefinitionWithAllLanguages, b: ResourceClassDefinitionWithAllLanguages) =>
        (a.label || '').localeCompare(b.label || '')
      )
    )
  );

  resourceClasses$: Observable<ApiData[]> = this._resourceClassDefinitions$.pipe(
    map(resClasses =>
      resClasses.map((resClassDef: ResourceClassDefinitionWithAllLanguages) => {
        return { iri: resClassDef.id, label: resClassDef.label || '' };
      })
    )
  );

  getSubclassesOfResourceClass$ = (classIri: string): Observable<ApiData[]> =>
    this._resourceClassDefinitions$.pipe(
      map(resClasses =>
        resClasses.filter(r => r.subClassOf.includes(classIri)).map(r => ({ iri: r.id, label: r.label || '' }))
      )
    );

  private _propertyDefinitions$: Observable<ResourcePropertyDefinition[]> = this.selectedOntology$.pipe(
    filter((o): o is ReadOntology => o !== null),
    map(o => o.getPropertyDefinitionsByType(ResourcePropertyDefinition)),
    map(props => props.filter(propDef => propDef.isEditable && !propDef.isLinkValueProperty)),
    map(xs =>
      [...xs].sort((a: ResourcePropertyDefinition, b: ResourcePropertyDefinition) =>
        (a.label || '').localeCompare(b.label || '')
      )
    )
  );

  private _setAvailableProperties(classIri?: string): void {
    const props$ =
      !classIri || classIri === 'all-resource-classes'
        ? this._propertyDefinitions$.pipe(
            map(props => [ResourceLabelPropertyData, ...props.map(this._createPropertyData)])
          )
        : this._getPropertiesOfResourceClass$(classIri);
    props$.subscribe(props => {
      this._availableProperties.next(props);
    });
  }

  private _getPropertiesOfResourceClass$ = (classIri: string): Observable<PropertyData[]> =>
    this._propertyDefinitions$.pipe(
      map(props => props.filter(p => p.subjectType === classIri).map(this._createPropertyData))
    );

  private _createPropertyData(propDef: ResourcePropertyDefinition): PropertyData {
    const propertyData: PropertyData = {
      iri: propDef.id,
      label: propDef.label || '',
      objectType: propDef.objectType || '',
      isLinkProperty: propDef.isLinkProperty,
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
}
