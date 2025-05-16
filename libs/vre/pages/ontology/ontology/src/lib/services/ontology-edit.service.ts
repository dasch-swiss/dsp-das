import { Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ApiResponseError,
  CanDoResponse,
  ClassDefinition,
  CreateResourceProperty,
  IHasProperty,
  KnoraApiConnection,
  ReadOntology,
  ResourceClassDefinitionWithAllLanguages,
  ResourcePropertyDefinitionWithAllLanguages,
  UpdateOntology,
  UpdateResourceClassCardinality,
  UpdateResourcePropertyLabel,
  UpdateResourcePropertyComment,
  UpdateResourcePropertyGuiElement,
  CreateResourceClass,
  Constants,
  CreateOntology,
  UpdateOntologyMetadata,
} from '@dasch-swiss/dsp-js';
import { UpdateEntityCommentOrLabel } from '@dasch-swiss/dsp-js/src/models/v2/ontologies/update/update-entity-comment-or-label';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspApiConnectionToken, DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  OntologiesSelectors,
  ProjectsSelectors,
  RemoveProjectOntologyAction,
  SetCurrentOntologyAction,
  UpdateProjectOntologyAction,
} from '@dasch-swiss/vre/core/state';
import {
  CreatePropertyData,
  CreatePropertyFormDialogComponent,
  CreatePropertyFormDialogProps,
  EditPropertyFormDialogComponent,
  PropertyData,
} from '@dasch-swiss/vre/ontology/ontology-properties';
import {
  DefaultClass,
  DefaultProperty,
  OntologyService,
  PropertyInfoObject,
  SortingService,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { MultiLanguages } from '@dasch-swiss/vre/ui/string-literal';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Store } from '@ngxs/store';
import { BehaviorSubject, concat, Observable, of } from 'rxjs';
import { filter, map, switchMap, take, tap, last, distinctUntilChanged } from 'rxjs/operators';
import {
  CreateResourceClassDialogComponent,
  CreateResourceClassDialogProps,
} from '../create-resource-class-dialog/create-resource-class-dialog.component';
import {
  EditResourceClassDialogComponent,
  EditResourceClassDialogProps,
} from '../edit-resource-class-dialog/edit-resource-class-dialog.component';
import { OntologyData } from '../ontology-form/ontology-form.type';

export type UpdateOntologyT =
  | CreateResourceProperty
  | UpdateResourceClassCardinality
  | UpdateEntityCommentOrLabel
  | UpdateResourcePropertyLabel
  | CreateResourceClass;

@Injectable({ providedIn: 'root' })
export class OntologyEditService {
  private _currentOntology = new BehaviorSubject<ReadOntology | null>(null);
  currentOntology$ = this._currentOntology.asObservable();

  latestChangedItem = new BehaviorSubject<string | null>(null);

  currentOntologyProperties$ = this.currentOntology$.pipe(
    map(ontology => {
      if (ontology) {
        const props = ontology.getAllPropertyDefinitions();
        return this._sortingService
          .keySortByAlphabetical(props, 'label')
          .filter(resProp => resProp.objectType !== Constants.LinkValue && !resProp.subjectType?.includes('Standoff'));
      }
      return [];
    })
  );

  currentOntologyClasses$ = this.currentOntology$.pipe(
    map(ontology => {
      if (ontology) {
        return this._initOntoClasses(
          ontology.getClassDefinitionsByType<ResourceClassDefinitionWithAllLanguages>(
            ResourceClassDefinitionWithAllLanguages
          )
        );
      }
      return [];
    })
  );

  currentOntologyCanBeDeleted$ = this.currentOntology$.pipe(
    filter(onto => onto !== null),
    map(onto => onto!.id),
    distinctUntilChanged(),
    switchMap(ontoId => this._dspApiConnection.v2.onto.canDeleteOntology(ontoId).pipe(map(canDo => canDo.canDo)))
  );

  private _isTransacting = new BehaviorSubject<boolean>(false);
  isTransacting$ = this._isTransacting.asObservable();

  private _canDeletePropertyMap = new Map<string, CanDoResponse>();

  get projectId(): string {
    return this._store.selectSnapshot(ProjectsSelectors.currentProject)?.id || '';
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
    this.updateCurrentOntologyInStoreIfNeeded(currentOntology);
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _dialog: MatDialog,
    private _dialogService: DialogService,
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
      this._isTransacting.next(false);
    } else {
      this.loadOntologyByLabel(label);
    }
  }

  private loadOntologyByLabel(label: string) {
    const project = this._store.selectSnapshot(ProjectsSelectors.currentProject);
    const iriBase = this._ontologyService.getIriBaseUrl();
    const iri = `${iriBase}/${RouteConstants.ontology}/${project?.shortcode}/${label}/v2`;
    this._loadOntology(iri);
  }

  private _loadOntology(iri: string) {
    this._dspApiConnection.v2.onto
      .getOntology(iri, true)
      .pipe(take(1))
      .subscribe(onto => {
        this._currentOntology.next(onto);
        this._isTransacting.next(false);
        this.updateCurrentOntologyInStoreIfNeeded(onto);
      });
  }

  private updateCurrentOntologyInStoreIfNeeded(ontology: ReadOntology) {
    const currentOntology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
    if (
      !currentOntology ||
      currentOntology.id !== ontology.id ||
      currentOntology.lastModificationDate !== ontology.lastModificationDate
    ) {
      this._store.dispatch(new UpdateProjectOntologyAction(ontology, this.projectId));
      this._store.dispatch(new SetCurrentOntologyAction(ontology));
    }
  }

  unloadOntology() {
    this._canDeletePropertyMap.clear();
    this._currentOntology.next(null);
  }

  private _initOntoClasses(allOntoClasses: ResourceClassDefinitionWithAllLanguages[]) {
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

  createOntology(ontologyData: OntologyData) {
    const createOntology = new CreateOntology();
    createOntology.label = `${this._store.selectSnapshot(ProjectsSelectors.currentProject)!.shortname}:${ontologyData.label}`;
    createOntology.name = ontologyData.name;
    createOntology.comment = ontologyData.comment;
    createOntology.attachedToProject = this.projectId;

    return this._dspApiConnection.v2.onto.createOntology(createOntology).pipe(
      tap(onto => {
        this._notification.openSnackBar('created successfully');
      })
    );
  }

  updateOntology(ontologyData: OntologyData) {
    const updateOntology = new UpdateOntologyMetadata();
    updateOntology.id = this.ontologyId;
    updateOntology.lastModificationDate = this.lastModificationDate;
    updateOntology.label = `${this._store.selectSnapshot(ProjectsSelectors.currentProject)!.shortname}:${ontologyData.label}`;
    updateOntology.comment = ontologyData.comment;

    return this._dspApiConnection.v2.onto.updateOntology(updateOntology).pipe(
      tap(onto => {
        this.lastModificationDate = onto.lastModificationDate;
        this._notification.openSnackBar('updated successfully');
      })
    );
  }

  deleteOntology$(ontology: ReadOntology) {
    return this._dialogService.afterConfirmation('Do you want to delete this data model ?').pipe(
      switchMap(del => {
        return this._dspApiConnection.v2.onto
          .deleteOntology({
            id: ontology.id,
            lastModificationDate: this.lastModificationDate,
          })
          .pipe(
            tap(() => {
              this._store.dispatch(new RemoveProjectOntologyAction(ontology.id, this.projectId));
              this._currentOntology.next(null);
            })
          );
      })
    );
  }

  openAddNewProperty(propType: DefaultProperty, assignToClass?: ClassDefinition) {
    const dialogRef = this._dialog.open<
      CreatePropertyFormDialogComponent,
      CreatePropertyFormDialogProps,
      CreatePropertyData
    >(CreatePropertyFormDialogComponent, {
      data: { propType, resClass: assignToClass },
    });

    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter((result): result is CreatePropertyData => !!result),
        switchMap(propertyData => this._createResourceProperty(propertyData))
      )
      .subscribe(propDef => {
        if (assignToClass) {
          this.lastModificationDate = propDef.lastModificationDate;
          this.assignPropertyToClass(propDef.id, assignToClass);
        } else {
          this._afterTransaction(propDef.id, `Successfully created ${propDef.label}.`);
        }
      });
  }

  openEditProperty(propDef: ResourcePropertyDefinitionWithAllLanguages, propType: DefaultProperty) {
    const dialogRef = this._dialog.open<EditPropertyFormDialogComponent, PropertyInfoObject, PropertyData>(
      EditPropertyFormDialogComponent,
      DspDialogConfig.dialogDrawerConfig({
        propDef,
        propType,
      })
    );

    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter((result): result is PropertyData => !!result),
        switchMap(propertyData => this._updateProperty(propDef.id, propertyData))
      )
      .subscribe(() => {
        this._afterTransaction(propDef.id, `Successfully updated ${propDef.label}.`);
      });
  }

  openEditResourceClass(resClass: ResourceClassDefinitionWithAllLanguages): void {
    this._dialog.open<EditResourceClassDialogComponent, EditResourceClassDialogProps, boolean>(
      EditResourceClassDialogComponent,
      DspDialogConfig.dialogDrawerConfig({
        id: resClass.id,
        title: resClass.label || '',
        ontologyId: this.ontologyId,
        lastModificationDate: this.lastModificationDate,
        name: this._ontologyService.getNameFromIri(resClass.id),
        comments: resClass.comments as MultiLanguages,
        labels: resClass.labels as MultiLanguages,
      })
    );
  }

  private _getCreateResourceProperty(data: CreatePropertyData): CreateResourceProperty {
    const createResProp = new CreateResourceProperty();
    createResProp.name = data.name;
    createResProp.label = data.labels;
    createResProp.comment = data.comments;
    createResProp.guiElement = data.propType.guiEle;
    createResProp.subPropertyOf = [data.propType.subPropOf];

    if (data.guiAttribute) {
      createResProp.guiAttributes = this._getGuiAttribute(data.guiAttribute, data.propType);
    }

    if (
      data.classDef &&
      data.guiAttribute &&
      [Constants.HasLinkTo, Constants.IsPartOf].includes(data.propType.subPropOf)
    ) {
      createResProp.objectType = data.guiAttribute;
      // createResProp.subjectType = data.classDef.id;
    } else {
      createResProp.objectType = data.propType.objectType;
    }

    if ([Constants.HasLinkTo, Constants.IsPartOf].includes(data.propType.subPropOf) && data.guiAttribute) {
      createResProp.objectType = data.guiAttribute;
      // createResProp.subjectType = data.classDef?.id || '';
    } else {
      createResProp.objectType = data.propType.objectType || '';
    }
    return createResProp;
  }

  private _getGuiAttribute(guiAttr: string, propType: DefaultProperty): string[] | undefined {
    switch (propType.guiEle) {
      case Constants.GuiColorPicker:
        return [`ncolors=${guiAttr}`];
      case Constants.GuiList:
      case Constants.GuiPulldown:
      case Constants.GuiRadio:
        return [`hlist=<${guiAttr}>`];
      case Constants.GuiSimpleText:
        // --> TODO could have two guiAttr fields: size and maxlength
        // we suggest to use default value for size; we do not support this guiAttr in DSP-App
        return [`maxlength=${guiAttr}`];
      case Constants.GuiSpinbox:
        // --> TODO could have two guiAttr fields: min and max
        return [`min=${guiAttr}`, `max=${guiAttr}`];
      case Constants.GuiTextarea:
        // --> TODO could have four guiAttr fields: width, cols, rows, wrap
        // we suggest to use default values; we do not support this guiAttr in DSP-App
        return ['width=100%'];
    }

    return undefined;
  }

  private _createResourceProperty(propertyData: CreatePropertyData) {
    this._isTransacting.next(true);
    const createProperty = this._getCreateResourceProperty(propertyData);
    const onto = this._getUpdateOntology<CreateResourceProperty>(createProperty);
    return this._dspApiConnection.v2.onto.createResourceProperty(onto).pipe(take(1));
  }

  assignPropertyToClass(propertyId: string, classDefinition: ClassDefinition, position?: number) {
    this._isTransacting.next(true);
    const updateOnto = this._getUpdateOntologyForPropertyAssignment(propertyId, classDefinition, position);
    this._dspApiConnection.v2.onto
      .addCardinalityToResourceClass(updateOnto)
      .pipe(take(1))
      .subscribe((res: ResourceClassDefinitionWithAllLanguages) => {
        this._afterTransaction(propertyId);
      });
  }

  removePropertyFromClass(property: IHasProperty, classId: string) {
    const delCard = this._getUpdateResourceClassCardinality(classId, [property]);
    const onto = this._getUpdateOntology<UpdateResourceClassCardinality>(delCard);
    this._isTransacting.next(true);
    this._dspApiConnection.v2.onto
      .deleteCardinalityFromResourceClass(onto)
      .pipe(take(1))
      .subscribe(() => {
        this._afterTransaction(classId);
      });
  }

  private _updateProperty(id: string, propertyData: PropertyData) {
    const updates: Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError>[] = [];
    console.log(propertyData);

    if (propertyData.labels !== undefined) {
      updates.push(this._updatePropertyLabels(id, propertyData.labels));
    }

    if (propertyData.comments !== undefined) {
      updates.push(this._updatePropertyComments(id, propertyData.comments));
    }

    // Todo: FIX!
    // if (propertyData.guiElement !== undefined) {
    //  updates.push(this._updatePropertyGuiElement(id, propertyData.guiElement));
    // }

    if (updates.length === 0) {
      return of();
    }

    this._isTransacting.next(true);
    return concat(...updates).pipe(
      last(),
      tap(() => {
        this._afterTransaction(id);
      })
    );
  }

  private _updatePropertyLabels(
    id: string,
    labels: StringLiteralV2[]
  ): Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError> {
    const updateLabel = new UpdateResourcePropertyLabel();
    console.log(labels);
    updateLabel.id = id;
    updateLabel.labels = labels;
    const onto = this._getUpdateOntology<UpdateResourcePropertyLabel>(updateLabel);
    console.log(onto);
    return this._updateResourceProperty(onto);
  }

  private _updatePropertyComments(
    id: string,
    comments: StringLiteralV2[]
  ): Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError> {
    const updateComment = new UpdateResourcePropertyComment();
    updateComment.id = id;
    updateComment.comments = comments;
    const onto = this._getUpdateOntology<UpdateResourcePropertyComment>(updateComment);
    return this._updateResourceProperty(onto);
  }

  private _updatePropertyGuiElement(
    id: string,
    guiElement: string
  ): Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError> {
    const updateGuiElement = new UpdateResourcePropertyGuiElement();
    updateGuiElement.id = id;
    updateGuiElement.guiElement = guiElement;

    const onto = this._getUpdateOntology<UpdateResourcePropertyGuiElement>(updateGuiElement);
    return this._updateResourceProperty(onto);
  }

  private _updateResourceProperty(
    updateOntology: UpdateOntology<
      UpdateResourcePropertyGuiElement | UpdateResourcePropertyLabel | UpdateResourcePropertyComment
    >
  ): Observable<ResourcePropertyDefinitionWithAllLanguages> {
    return this._dspApiConnection.v2.onto.updateResourceProperty(updateOntology).pipe(
      tap(res => {
        this.lastModificationDate = res?.lastModificationDate;
      })
    );
  }

  private _getUpdateOntology<T extends UpdateOntologyT>(entity: T): UpdateOntology<T> {
    const onto = new UpdateOntology<T>();
    onto.id = this.ontologyId;
    onto.lastModificationDate = this.lastModificationDate;
    onto.entity = entity;
    return onto;
  }

  createResourceClass(resClassInfo: DefaultClass): void {
    this._dialog
      .open<CreateResourceClassDialogComponent, CreateResourceClassDialogProps, boolean>(
        CreateResourceClassDialogComponent,
        DspDialogConfig.dialogDrawerConfig({
          id: resClassInfo.iri,
          title: resClassInfo.label,
          ontologyId: this.ontologyId,
          lastModificationDate: this.lastModificationDate,
        })
      )
      .afterClosed()
      .pipe(map(result => result ?? false))
      .subscribe((created: boolean) => {
        if (created) {
          this._afterTransaction(resClassInfo.iri, `Successfully created ${resClassInfo.label}.`);
        }
      });
  }

  deleteResourceClass(resClassIri: string) {
    this._dialogService
      .afterConfirmation('Do you want to delete this resource class?')
      .pipe(
        take(1),
        tap(() => this._isTransacting.next(true)),
        switchMap(() =>
          this._dspApiConnection.v2.onto.deleteResourceClass({
            id: resClassIri,
            lastModificationDate: this.lastModificationDate,
          })
        )
      )
      .subscribe({
        next: () => {
          this._afterTransaction(resClassIri, `Successfully deleted ${resClassIri}.`);
        },
      });
  }

  canDeleteResourceClass$(classId: string): Observable<CanDoResponse | ApiResponseError> {
    return this._dspApiConnection.v2.onto.canDeleteResourceClass(classId);
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

  deleteProperty(iri: string) {
    this._dialogService
      .afterConfirmation('Do you want to delete this property?')
      .pipe(
        take(1),
        switchMap(() =>
          this._dspApiConnection.v2.onto.deleteResourceProperty({
            id: iri,
            lastModificationDate: this.lastModificationDate,
          })
        )
      )
      .subscribe(() => {
        this._afterTransaction(iri, `Successfully deleted ${iri}.`);
      });
  }

  propertyCanBeRemovedFromClass(propCard: IHasProperty, classIri: string): Observable<CanDoResponse> {
    if (propCard.isInherited) {
      const canDoRes = new CanDoResponse();
      canDoRes.canDo = false;
      canDoRes.cannotDoReason = 'The property is inherited from another class';
      return of(canDoRes);
    }
    const updateCard = this._getUpdateResourceClassCardinality(classIri, [propCard]);
    const onto = this._getUpdateOntology<UpdateResourceClassCardinality>(updateCard);
    return this._dspApiConnection.v2.onto.canDeleteCardinalityFromResourceClass(onto);
  }

  updateGuiOrderOfClassProperties(classId: string, properties: IHasProperty[]) {
    const updateResourceClassCard = this._getUpdateResourceClassCardinality(classId, properties);
    const updateOntology = this._getUpdateOntology<UpdateResourceClassCardinality>(updateResourceClassCard);
    this._dspApiConnection.v2.onto
      .replaceGuiOrderOfCardinalities(updateOntology)
      .pipe(take(1))
      .subscribe(() => {
        this._afterTransaction(classId);
      });
  }

  updateCardinalitiesOfResourceClass(classId: string, cardinalities: IHasProperty[] = []) {
    this._isTransacting.next(true);
    const updateResourceClassCard = this._getUpdateResourceClassCardinality(classId, cardinalities);
    this._updateCardinalityOfResourceClass(updateResourceClassCard);
  }

  private _updateCardinalityOfResourceClass(classCardinality: UpdateResourceClassCardinality) {
    const updateOntology = this._getUpdateOntology<UpdateResourceClassCardinality>(classCardinality);
    this._dspApiConnection.v2.onto
      .replaceCardinalityOfResourceClass(updateOntology)
      .pipe(take(1))
      .subscribe(response => {
        this._afterTransaction(classCardinality.id);
      });
  }

  private _getUpdateResourceClassCardinality(
    id: string,
    cardinalities: IHasProperty[]
  ): UpdateResourceClassCardinality {
    const updateCard = new UpdateResourceClassCardinality();
    updateCard.id = id;
    updateCard.cardinalities = cardinalities;
    return updateCard;
  }

  private _getUpdateOntologyForPropertyAssignment(
    propertyId: string,
    classDefinition: ClassDefinition,
    position?: number
  ): UpdateOntology<UpdateResourceClassCardinality> {
    const guiOrder =
      position ||
      classDefinition.propertiesList.reduce((prev, current) => Math.max(prev, current.guiOrder ?? 0), 0) + 1;

    const propCard: IHasProperty = {
      propertyIndex: propertyId,
      cardinality: 1, // default: not required, not multiple
      guiOrder,
    };
    const updateCard = this._getUpdateResourceClassCardinality(classDefinition.id, [propCard]);
    return this._getUpdateOntology<UpdateResourceClassCardinality>(updateCard);
  }

  private _afterTransaction(id: string, notification?: string) {
    this._loadOntology(this.ontologyId);
    this._canDeletePropertyMap.clear();
    this._isTransacting.next(false);
    this.latestChangedItem.next(id);
    if (notification) {
      this._notification.openSnackBar(notification);
    }
  }
}
