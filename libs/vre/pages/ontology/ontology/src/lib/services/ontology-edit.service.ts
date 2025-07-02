import { Inject, Injectable } from '@angular/core';
import {
  ApiResponseError,
  CanDoResponse,
  ClassDefinition,
  IHasProperty,
  KnoraApiConnection,
  ReadOntology,
  ResourceClassDefinitionWithAllLanguages,
  ResourcePropertyDefinitionWithAllLanguages,
  UpdateOntology,
  UpdateResourcePropertyLabel,
  UpdateResourcePropertyComment,
  UpdateResourcePropertyGuiElement,
  Constants,
  OntologyMetadata,
  StringLiteral,
  UpdateResourceClassLabel,
  UpdateResourceClassComment,
  ListNodeInfo,
} from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/3rd-party-services/api';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  ListsFacade,
  OntologiesSelectors,
  ProjectsSelectors,
  RemoveProjectOntologyAction,
  ResetCurrentOntologyIfNeededAction,
} from '@dasch-swiss/vre/core/state';
import { OntologyService, SortingService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, concat, defer, Observable, of } from 'rxjs';
import { filter, map, switchMap, take, tap, last, distinctUntilChanged } from 'rxjs/operators';
import { CreateOntologyData, UpdateOntologyData } from '../forms/ontology-form/ontology-form.type';
import { CreatePropertyData, UpdatePropertyData } from '../forms/property-form/property-form.type';
import { ResourceClassFormData, UpdateResourceClassData } from '../forms/resource-class-form/resource-class-form.type';
import { ClassPropertyInfo, ResourceClassInfo, PropertyInfo, ClassShortInfo } from '../ontology.types';
import { MakeOntologyFor, OntologyContext, ProjectContext } from './make-ontology-for';

@Injectable({ providedIn: 'root' })
export class OntologyEditService {
  private _currentOntologyInfo = new BehaviorSubject<OntologyMetadata | ReadOntology | null>(null);
  currentOntologyInfo$ = this._currentOntologyInfo.asObservable();

  private _currentOntology = new BehaviorSubject<ReadOntology | null>(null);
  currentOntology$ = this._currentOntology.asObservable();

  private _projectsLists$ = this._lists.getListsInProject$();

  latestChangedItem = new BehaviorSubject<string | undefined>(undefined);

  currentOntologyProperties$: Observable<PropertyInfo[]> = combineLatest([
    this.currentOntology$,
    this._store.select(OntologiesSelectors.currentProjectOntologies),
    this._projectsLists$,
  ]).pipe(
    map(([currentOntology, allOntologies, allLists]) => {
      if (!currentOntology) return [];
      const props = currentOntology.getAllPropertyDefinitions() as ResourcePropertyDefinitionWithAllLanguages[];
      return this._buildPropertyInfoList(allOntologies, allLists, props);
    })
  );

  currentProjectsProperties$: Observable<PropertyInfo[]> = combineLatest([
    this._store.select(OntologiesSelectors.currentProjectOntologies),
    this.currentOntology$, // still needed for resolving current ontology match
    this._projectsLists$,
  ]).pipe(
    map(([ontologies, currentOntology, allLists]) => {
      const allProps = ontologies.flatMap(
        o => o.getAllPropertyDefinitions() as ResourcePropertyDefinitionWithAllLanguages[]
      );
      return this._buildPropertyInfoList(ontologies, allLists, allProps);
    })
  );

  currentOntologyClasses$: Observable<ResourceClassInfo[]> = combineLatest([
    this.currentOntology$,
    this.currentProjectsProperties$,
  ]).pipe(
    map(([ontology, allProperties]) => {
      if (!ontology) return [];

      const classes = this._filterAndSortOntoClasses(
        ontology.getClassDefinitionsByType<ResourceClassDefinitionWithAllLanguages>(
          ResourceClassDefinitionWithAllLanguages
        )
      );

      return classes.map(resClass => {
        const propertyIds = resClass.propertiesList.map(p => p.propertyIndex);

        const matchingProps: ClassPropertyInfo[] = allProperties
          .filter(prop => propertyIds.includes(prop.propDef.id))
          .map(prop => {
            const iHasProperty = resClass.propertiesList.find(p => p.propertyIndex === prop.propDef.id)!;

            return {
              ...prop,
              iHasProperty,
              classDefinition: resClass,
            } satisfies ClassPropertyInfo;
          })
          .sort((a, b) => {
            const aOrder = resClass.propertiesList.find(p => p.propertyIndex === a.propDef.id)?.guiOrder ?? 0;
            const bOrder = resClass.propertiesList.find(p => p.propertyIndex === b.propDef.id)?.guiOrder ?? 0;
            return aOrder - bOrder;
          });

        return new ResourceClassInfo(resClass, matchingProps);
      });
    })
  );

  currentOntologyCanBeDeleted$ = this.currentOntologyInfo$.pipe(
    filter(onto => onto !== null),
    map(onto => onto!.id),
    distinctUntilChanged(),
    switchMap(ontoId => this._dspApiConnection.v2.onto.canDeleteOntology(ontoId).pipe(map(canDo => canDo.canDo)))
  );

  private _isTransacting = new BehaviorSubject<boolean>(false);
  isTransacting$ = this._isTransacting.asObservable();

  get isTransacting(): boolean {
    return this._isTransacting.value;
  }

  private _canDeletePropertyMap = new Map<string, CanDoResponse>();

  get projectId(): string {
    return this._store.selectSnapshot(ProjectsSelectors.currentProject)!.id;
  }

  get projectCtx(): ProjectContext {
    return {
      projectId: this.projectId,
      projectShort: this._store.selectSnapshot(ProjectsSelectors.currentProject)!.shortname,
    };
  }

  get ontologyId(): string {
    return this._currentOntology.value?.id || '';
  }

  get lastModificationDate(): string {
    return this._currentOntology.value?.lastModificationDate || '';
  }

  set lastModificationDate(date: string | undefined) {
    const currentOntology = this._currentOntology.value;
    if (!currentOntology || !date) {
      return;
    }
    currentOntology.lastModificationDate = date;
    this._currentOntology.next(currentOntology);
    this._store.dispatch(new ResetCurrentOntologyIfNeededAction(currentOntology, this.projectId));
  }

  get ctx(): OntologyContext {
    return {
      id: this.ontologyId,
      lastModificationDate: this.lastModificationDate,
    };
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _lists: ListsFacade,
    private _notification: NotificationService,
    private _ontologyService: OntologyService,
    private _sortingService: SortingService,
    private _store: Store
  ) {}

  initOntologyByLabel(label: string) {
    this._isTransacting.next(true);
    this._canDeletePropertyMap.clear();
    const ontologies = this._store.selectSnapshot(OntologiesSelectors.currentProjectOntologies);
    const ontologyFromStore = ontologies.find(onto => OntologyService.getOntologyName(onto.id) == label);

    if (ontologyFromStore) {
      this._currentOntology.next(ontologyFromStore);
      this._currentOntologyInfo.next(ontologyFromStore);
      this._isTransacting.next(false);
    } else {
      this._loadOntologyByLabel(label);
    }
  }

  private _loadOntologyByLabel(label: string) {
    const project = this._store.selectSnapshot(ProjectsSelectors.currentProject);
    const iriBase = this._ontologyService.getIriBaseUrl();
    const iri = `${iriBase}/${RouteConstants.ontology}/${project?.shortcode}/${label}/v2`;
    this._loadOntology(iri);
  }

  unloadOntology() {
    this._canDeletePropertyMap.clear();
    this._currentOntology.next(null);
  }

  private _loadOntology(iri: string) {
    this._dspApiConnection.v2.onto
      .getOntology(iri, true)
      .pipe(take(1))
      .subscribe(onto => {
        this._currentOntologyInfo.next(onto);
        this._currentOntology.next(onto);
        this._isTransacting.next(false);
        this._store.dispatch(new ResetCurrentOntologyIfNeededAction(onto, this.projectId));
      });
  }

  private _buildPropertyInfoList(
    ontologies: ReadOntology[],
    allLists: ListNodeInfo[],
    props: ResourcePropertyDefinitionWithAllLanguages[]
  ): PropertyInfo[] {
    return this._sortingService
      .keySortByAlphabetical(props, 'label')
      .filter(resProp => resProp.objectType !== Constants.LinkValue && !resProp.subjectType?.includes('Standoff'))
      .map((prop): PropertyInfo => {
        const propId = prop.id;
        const baseOntologyId = propId.split('#')[0];
        const baseOntologyLabel = ontologies.find(o => o.id === baseOntologyId)?.label || '';

        const usedByClasses: ClassShortInfo[] = [];
        ontologies.forEach(onto => {
          getAllEntityDefinitionsAsArray(onto.classes).forEach(resClass => {
            const usedByClass = resClass.propertiesList.some(p => p.propertyIndex === propId);
            const alreadyAdded = usedByClasses.some(c => c.id === resClass.id);

            if (usedByClass && !alreadyAdded) {
              usedByClasses.push({
                id: resClass.id,
                label: resClass.label!,
                comment: `${onto.label}: ${resClass.comment ?? ''}`,
                restrictedToClass: prop.isLinkProperty ? prop.subjectType : undefined,
              });
            }
          });
        });

        usedByClasses.sort((a, b) => a?.label?.localeCompare(b?.label));

        const propertyInfo: PropertyInfo = {
          propDef: prop,
          propType: this._ontologyService.getDefaultProperty(prop),
          baseOntologyId,
          baseOntologyLabel,
          usedByClasses,
        };

        if (prop.objectType === Constants.Region) {
          propertyInfo.objectLabel = 'Region';
          return propertyInfo;
        }

        if (prop.objectType === Constants.ListValue) {
          const listIri = prop.guiAttributes?.[0]?.split('<')[1]?.replace(/>/g, '');
          const { label, comment } = this._getListLabelAndComment(listIri, allLists);
          propertyInfo.objectLabel = label;
          propertyInfo.objectComment = comment;
          return propertyInfo;
        }

        if (prop.isLinkProperty && prop.objectType) {
          const { label, comment } = this._getObjectLabelAndComment(prop.objectType, ontologies);
          propertyInfo.objectLabel = label ?? '';
          propertyInfo.objectComment = comment ?? '';
        }

        return propertyInfo;
      });
  }

  private _filterAndSortOntoClasses(allOntoClasses: ResourceClassDefinitionWithAllLanguages[]) {
    const ontoClasses: ResourceClassDefinitionWithAllLanguages[] = [];

    // classes which are not a subClass of Standoff
    allOntoClasses.forEach(resClass => {
      if (resClass.subClassOf.length) {
        const splittedSubClass = resClass.subClassOf[0].split('#');
        if (!splittedSubClass[0].includes(Constants.StandoffOntology) && !splittedSubClass[1].includes('Standoff')) {
          ontoClasses.push(resClass);
        }
      }
    });
    return this._sortingService.keySortByAlphabetical(ontoClasses, 'label');
  }

  private _getListLabelAndComment(listId: string, allLists: ListNodeInfo[]): { label?: string; comment?: string } {
    const list = allLists.find(l => l.id === listId);
    return {
      label: list?.labels?.[0]?.value,
      comment: list?.comments?.[0]?.value,
    };
  }

  private _getObjectLabelAndComment(
    objectType: string,
    allOntologies: ReadOntology[]
  ): { label?: string; comment?: string } {
    const baseOntologyId = objectType.split('#')[0];
    const onto = allOntologies.find(o => o.id === baseOntologyId);

    const classDef = onto?.classes?.[objectType];
    return {
      label: classDef?.label,
      comment: classDef?.comment,
    };
  }

  createOntology$({ name, label, comment }: CreateOntologyData) {
    const createOntology = MakeOntologyFor.createOntology(this.projectCtx, name, label, comment);
    this._isTransacting.next(true);
    return this._dspApiConnection.v2.onto.createOntology(createOntology).pipe(
      tap(onto => {
        this._afterOntologyChange(onto);
      })
    );
  }

  updateOntology$({ id, label, comment }: UpdateOntologyData) {
    const updateOntology = MakeOntologyFor.updateOntologyMetadata(this.ctx, label, comment);
    this._isTransacting.next(true);

    return this._dspApiConnection.v2.onto.updateOntology(updateOntology).pipe(
      tap(onto => {
        this._afterOntologyChange(onto);
      })
    );
  }

  deleteOntology$(id: string) {
    return this._dspApiConnection.v2.onto
      .deleteOntology({
        id,
        lastModificationDate: this.lastModificationDate,
      })
      .pipe(
        tap(() => {
          this._store.dispatch(new RemoveProjectOntologyAction(id, this.projectId));
          // this._store.dispatch(new LoadProjectOntologiesAction(this.projectId));
          this._currentOntology.next(null);
        })
      );
  }

  createResourceClass$(classData: ResourceClassFormData) {
    const createOntology = MakeOntologyFor.createResourceClass(this.ctx, classData);
    this._isTransacting.next(true);

    return this._dspApiConnection.v2.onto.createResourceClass(createOntology).pipe(
      tap(resClass => {
        this.lastModificationDate = resClass.lastModificationDate;
        this._afterOntologyItemChange(resClass.id, `Successfully created ${resClass.id}.`);
      })
    );
  }

  /**
   * Yes, there is not a route to update a class at once ...
   */
  updateResourceClass$(classData: UpdateResourceClassData) {
    const updates: Observable<ResourceClassDefinitionWithAllLanguages | ApiResponseError>[] = [];

    if (classData.labels !== undefined) {
      updates.push(this._updateResourceClassLabels$(classData.id, classData.labels));
    }

    if (classData.comments !== undefined) {
      updates.push(this._updateResourceClassComments$(classData.id, classData.comments));
    }

    if (updates.length === 0) {
      return of();
    }

    this._isTransacting.next(true);
    return concat(...updates).pipe(
      last(),
      tap(() => {
        this._afterOntologyItemChange(classData.id);
      })
    );
  }

  private _updateResourceClassLabels$(id: string, labels: StringLiteral[]) {
    return defer(() => {
      return this._updateResourceClass$(MakeOntologyFor.updateClassLabel(this.ctx, id, labels));
    });
  }

  private _updateResourceClassComments$(id: string, comments: StringLiteral[]) {
    return defer(() => {
      return this._updateResourceClass$(MakeOntologyFor.updateClassComments(this.ctx, id, comments));
    });
  }

  private _updateResourceClass$(updateOntology: UpdateOntology<UpdateResourceClassLabel | UpdateResourceClassComment>) {
    return this._dspApiConnection.v2.onto.updateResourceClass(updateOntology).pipe(
      tap(resClass => {
        this.lastModificationDate = resClass.lastModificationDate;
      })
    );
  }

  createResourceProperty(propertyData: CreatePropertyData, assignToClass?: ClassDefinition) {
    this._isTransacting.next(true);
    this._createResourceProperty$(propertyData)
      .pipe(take(1))
      .subscribe(propDef => {
        if (assignToClass) {
          this.lastModificationDate = propDef.lastModificationDate;
          this.assignPropertyToClass(propDef.id, assignToClass);
        } else {
          this._afterOntologyItemChange(propDef.id);
        }
      });
  }

  assignPropertyToClass(propertyId: string, classDefinition: ClassDefinition, position?: number) {
    this._isTransacting.next(true);

    const guiOrder =
      position ||
      classDefinition.propertiesList.reduce((prev, current) => Math.max(prev, current.guiOrder ?? 0), 0) + 1;

    const propCard: IHasProperty = {
      propertyIndex: propertyId,
      cardinality: 1, // default: not required, not multiple
      guiOrder,
    };

    const updateOntology = MakeOntologyFor.updateCardinalityOfResourceClass(this.ctx, classDefinition.id, [propCard]);
    this._dspApiConnection.v2.onto
      .addCardinalityToResourceClass(updateOntology)
      .pipe(take(1))
      .subscribe((res: ResourceClassDefinitionWithAllLanguages) => {
        this._afterOntologyItemChange(propertyId);
      });
  }

  /**
   * Yes, we need to pass an UpdateOntology<UpdateResourceClassCardinality> containing one property to
   * deleteCardinalityFromResourceClass in order to remove a property ...
   */
  removePropertyFromClass(property: IHasProperty, classId: string) {
    const updateOntology = MakeOntologyFor.updateCardinalityOfResourceClass(this.ctx, classId, [property]);
    this._isTransacting.next(true);
    this._dspApiConnection.v2.onto
      .deleteCardinalityFromResourceClass(updateOntology)
      .pipe(take(1))
      .subscribe(() => {
        this._afterOntologyItemChange(classId);
      });
  }

  /**
   * Yes, there is not a route to update a whole property at once ...
   */
  updateProperty$(propertyData: UpdatePropertyData) {
    const updates: Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError>[] = [];

    if (propertyData.labels !== undefined) {
      updates.push(this._updatePropertyLabels$(propertyData.id, propertyData.labels));
    }

    if (propertyData.comment !== undefined) {
      updates.push(this._updatePropertyComments$(propertyData.id, propertyData.comment));
    }

    this._isTransacting.next(true);
    return concat(...updates).pipe(
      last(),
      tap(() => {
        this._afterOntologyItemChange(propertyData.id);
      })
    );
  }

  private _updatePropertyLabels$(id: string, labels: StringLiteralV2[]) {
    return defer(() => {
      const upd = MakeOntologyFor.updatePropertyLabel(this.ctx, id, labels);
      return this._updateResourceProperty$(upd);
    });
  }

  private _updatePropertyComments$(id: string, comments: StringLiteralV2[]) {
    return defer(() => {
      const upd = MakeOntologyFor.updatePropertyComment(this.ctx, id, comments);
      return this._updateResourceProperty$(upd);
    });
  }

  private _updateResourceProperty$(
    updateOntology: UpdateOntology<
      UpdateResourcePropertyGuiElement | UpdateResourcePropertyLabel | UpdateResourcePropertyComment
    >
  ): Observable<ResourcePropertyDefinitionWithAllLanguages> {
    return this._dspApiConnection.v2.onto.updateResourceProperty(updateOntology).pipe(
      tap(prop => {
        this.lastModificationDate = prop?.lastModificationDate;
      })
    );
  }

  private _createResourceProperty$(propertyData: CreatePropertyData) {
    this._isTransacting.next(true);
    const onto = MakeOntologyFor.createProperty(this.ctx, propertyData);
    return this._dspApiConnection.v2.onto.createResourceProperty(onto).pipe(take(1));
  }

  canDeleteResourceClass$(classId: string): Observable<CanDoResponse | ApiResponseError> {
    return this._dspApiConnection.v2.onto.canDeleteResourceClass(classId);
  }

  deleteResourceClass$(id: string) {
    this._isTransacting.next(true);
    return this._dspApiConnection.v2.onto
      .deleteResourceClass({
        id,
        lastModificationDate: this.lastModificationDate,
      })
      .pipe(
        tap(deleteResponse => {
          this.lastModificationDate = deleteResponse.lastModificationDate;
          this._afterOntologyItemChange();
        })
      );
  }

  canDeleteResourceProperty$(propertyId: string): Observable<CanDoResponse> {
    const canDo = this._canDeletePropertyMap.get(propertyId);
    if (canDo) {
      return of(canDo);
    }

    return this._dspApiConnection.v2.onto.canDeleteResourceProperty(propertyId).pipe(
      tap((canDoRes: CanDoResponse) => {
        this._canDeletePropertyMap.set(propertyId, canDoRes);
      })
    );
  }

  deleteProperty$(id: string) {
    this._isTransacting.next(true);
    return this._dspApiConnection.v2.onto
      .deleteResourceProperty({
        id,
        lastModificationDate: this.lastModificationDate,
      })
      .pipe(
        tap(deleteResponse => {
          this.lastModificationDate = deleteResponse.lastModificationDate;
          this._afterOntologyItemChange();
        })
      );
  }

  propertyCanBeRemovedFromClass$(propCard: IHasProperty, classId: string): Observable<CanDoResponse> {
    if (propCard.isInherited) {
      // no need to send a request to the server
      return of({ canDo: false, cannotDoReason: 'The property is inherited from another class' } as CanDoResponse);
    }
    const updateOntology = MakeOntologyFor.updateCardinalityOfResourceClass(this.ctx, classId, [propCard]);
    return this._dspApiConnection.v2.onto.canDeleteCardinalityFromResourceClass(updateOntology);
  }

  updateGuiOrderOfClassProperties(classId: string, properties: IHasProperty[]) {
    this._isTransacting.next(true);
    const updateOntology = MakeOntologyFor.updateCardinalityOfResourceClass(this.ctx, classId, properties);
    this._dspApiConnection.v2.onto
      .replaceGuiOrderOfCardinalities(updateOntology)
      .pipe(take(1))
      .subscribe(() => {
        this._afterOntologyItemChange(classId);
      });
  }

  updatePropertiesOfResourceClass(classId: string, properties: IHasProperty[] = []) {
    this._isTransacting.next(true);
    const updateOntology = MakeOntologyFor.updateCardinalityOfResourceClass(this.ctx, classId, properties);
    this._dspApiConnection.v2.onto
      .replaceCardinalityOfResourceClass(updateOntology) // yes, someone called the properties "cardinalities" in the API
      .pipe(take(1))
      .subscribe(response => {
        this._afterOntologyItemChange(classId);
      });
  }

  private _afterOntologyChange(ontology: OntologyMetadata) {
    this.lastModificationDate = ontology.lastModificationDate;
    this._currentOntologyInfo.next(ontology);
    this._isTransacting.next(false);
    // this.latestChangedItem.next(ontology.id);
    this._loadOntology(ontology.id);
  }

  private _afterOntologyItemChange(id?: string, notification?: string) {
    this._loadOntology(this.ontologyId);
    this._canDeletePropertyMap.clear();
    this._isTransacting.next(false);
    this.latestChangedItem.next(id);
    if (notification) {
      this._notification.openSnackBar(notification);
    }
  }
}
