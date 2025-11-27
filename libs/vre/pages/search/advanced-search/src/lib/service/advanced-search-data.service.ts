import { Inject, Injectable } from '@angular/core';
import {
  Constants,
  KnoraApiConnection,
  ReadOntology,
  ResourceClassDefinitionWithAllLanguages,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { BehaviorSubject, combineLatest, filter, map, Observable, startWith, tap } from 'rxjs';
import { ResourceLabel } from '../constants';
import { IriLabelPair, Predicate } from '../model';

@Injectable()
export class AdvancedSearchDataService {
  private readonly ResourceLabelPropertyData: Predicate = {
    iri: ResourceLabel,
    label: 'Resource Label',
    objectValueType: ResourceLabel,
    isLinkProperty: false,
  } as const;

  private readonly SEARCH_ALL_RESOURCE_CLASSES_OPTION: IriLabelPair = {
    iri: 'all-resource-classes',
    label: 'All resource classes',
  } as const;

  private _ontologies = new BehaviorSubject<IriLabelPair[]>([]);
  ontologies$ = this._ontologies.asObservable();

  private _selectedOntology = new BehaviorSubject<ReadOntology | null>(null);
  selectedOntology$ = this._selectedOntology.asObservable();

  private _ontologyLoading = new BehaviorSubject<boolean>(true);
  ontologyLoading$ = this._ontologyLoading.asObservable();

  private _availableProperties = new BehaviorSubject<Predicate[]>([]);
  availableProperties$ = this._availableProperties.asObservable();

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  init(projectIri: string, ontology?: IriLabelPair, resourceClass?: IriLabelPair) {
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

  setOntology(ontologyIri: string, resourceClass?: IriLabelPair) {
    this._ontologyLoading.next(true);
    this._dspApiConnection.v2.onto.getOntology(ontologyIri, true).subscribe({
      next: ontology => {
        this._selectedOntology.next(ontology);
        this._ontologyLoading.next(false);
        this.setSelectedResourceClass(resourceClass);
      },
    });
  }

  setSelectedResourceClass(resourceClass?: IriLabelPair) {
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

  resourceClasses$: Observable<IriLabelPair[]> = this._resourceClassDefinitions$.pipe(
    startWith([]),
    // tap(resClasses => console.log('resource classes', resClasses)),
    map(resClasses =>
      resClasses.map((resClassDef: ResourceClassDefinitionWithAllLanguages) => {
        return { iri: resClassDef.id, label: resClassDef.label || '' };
      })
    )
  );

  getResourceClassObjectsForProperty$(propertyIri?: string): Observable<IriLabelPair[]> {
    if (!propertyIri) {
      return this.resourceClasses$.pipe(
        map(classes => [this.SEARCH_ALL_RESOURCE_CLASSES_OPTION, ...classes]),
        startWith([this.SEARCH_ALL_RESOURCE_CLASSES_OPTION])
      );
    }
    return combineLatest(this.resourceClasses$, this._propertyDefinitions$).pipe(
      map(([resClasses, propDefs]) => {
        const propDef = propDefs.find(p => p.id === propertyIri);
        if (!propDef) {
          return [];
        }
        const objectType = propDef.objectType;
        if (!objectType) {
          return [];
        }
        return resClasses.filter(rc => rc.iri === objectType);
      })
    );
  }

  getSubclassesOfResourceClass$ = (classIri: string): Observable<IriLabelPair[]> =>
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
            map(props => [this.ResourceLabelPropertyData, ...props.map(this._createPropertyData)])
          )
        : this.getPropertiesOfResourceClass$(classIri);
    props$.subscribe(props => {
      this._availableProperties.next(props);
    });
  }

  getPropertiesOfResourceClass$ = (classIri: string): Observable<Predicate[]> =>
    combineLatest([this._getPropertyIrisForClass$(classIri), this._propertyDefinitions$]).pipe(
      // tap(([c, p]) => console.log('class properties', c, p)),
      map(([resProps, props]) => props.filter(p => resProps.includes(p.id)).map(this._createPropertyData))
    );

  private _getPropertyIrisForClass$ = (classIri: string): Observable<string[]> =>
    this._resourceClassDefinitions$.pipe(
      map(resClasses => resClasses.find(r => r.id === classIri)),
      filter((resClass): resClass is ResourceClassDefinitionWithAllLanguages => resClass !== undefined),
      map((resClass: ResourceClassDefinitionWithAllLanguages) =>
        resClass.propertiesList.map(property => property.propertyIndex)
      )
    );

  private _createPropertyData(propDef: ResourcePropertyDefinition): Predicate {
    const propertyData: Predicate = {
      iri: propDef.id,
      label: propDef.label || '',
      objectValueType: propDef.objectType || '',
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

  get selectedOntology(): IriLabelPair {
    return this._selectedOntology.value
      ? { iri: this._selectedOntology.value.id, label: this._selectedOntology.value.label || '' }
      : ({} as IriLabelPair);
  }

  get classIris(): string[] {
    const ontology = this._selectedOntology.value;
    if (!ontology) {
      return [];
    }
    return ontology.getClassDefinitionsByType(ResourceClassDefinitionWithAllLanguages).map(c => c.id);
  }
}
