import { Inject, Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ApiResponseError,
  CanDoResponse,
  ClassDefinition,
  CreateResourceProperty,
  IHasProperty,
  KnoraApiConnection,
  OntologyMetadata,
  ReadOntology,
  ReadProject,
  ResourceClassDefinitionWithAllLanguages,
  ResourcePropertyDefinitionWithAllLanguages,
  UpdateOntology,
  UpdateResourceClassCardinality,
  UpdateResourcePropertyLabel,
  UpdateResourcePropertyComment,
  UpdateResourcePropertyGuiElement,
  CreateResourceClass,
  Constants,
} from '@dasch-swiss/dsp-js';
import { UpdateEntityCommentOrLabel } from '@dasch-swiss/dsp-js/src/models/v2/ontologies/update/update-entity-comment-or-label';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspApiConnectionToken, DspDialogConfig } from '@dasch-swiss/vre/core/config';
import {
  LoadOntologyAction,
  LoadProjectOntologiesAction,
  OntologiesSelectors,
  ProjectsSelectors,
  PropToDisplay,
  RemovePropertyAction,
  SetCurrentOntologyAction,
  SetCurrentProjectOntologyPropertiesAction,
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
  ProjectService,
  PropertyInfoObject,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { MultiLanguages } from '@dasch-swiss/vre/ui/string-literal';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Store } from '@ngxs/store';
import { concat, Observable, of, Subject } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
// import { UpdateResourcePropertyGuiElement } from '../../../../../../3rd-party-services/api/src/lib/services/v2/ontology/update-resource-property-gui-element.interface';
import {
  CreateResourceClassDialogComponent,
  CreateResourceClassDialogProps,
} from '../create-resource-class-dialog/create-resource-class-dialog.component';
import {
  EditResourceClassDialogComponent,
  EditResourceClassDialogProps,
} from '../edit-resource-class-dialog/edit-resource-class-dialog.component';
import { OntologyFormComponent } from '../ontology-form/ontology-form.component';
import { OntologyFormProps } from '../ontology-form/ontology-form.type';

export type UpdateOntologyT =
  | CreateResourceProperty
  | UpdateResourceClassCardinality
  | UpdateEntityCommentOrLabel
  | UpdateResourcePropertyLabel
  | CreateResourceClass;

@Injectable({ providedIn: 'root' })
export class OntologyEditService implements OnDestroy {
  private _currentProject$ = this._store.select(ProjectsSelectors.currentProject);
  private _currentProject?: ReadProject;

  private _currentOntology$ = this._store.select(OntologiesSelectors.currentOntology);
  private _currentOntology: ReadOntology | null = null;

  private _destroyed: Subject<void> = new Subject<void>();

  get projectId(): string {
    return this._currentProject?.id || '';
  }

  get projectUuid(): string {
    return ProjectService.IriToUuid(this.projectId);
  }

  get ontologyId(): string {
    return this._currentOntology?.id || '';
  }

  get lastModificationDate(): string {
    return this._currentOntology?.lastModificationDate || '';
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _dialog: MatDialog,
    private _dialogService: DialogService,
    private _ontologyService: OntologyService,
    private _store: Store
  ) {
    this._currentProject$.pipe(takeUntil(this._destroyed)).subscribe(project => {
      this._currentProject = project;
    });

    this._currentOntology$.pipe(takeUntil(this._destroyed)).subscribe(onto => {
      this._currentOntology = onto;
    });
  }

  openCreateNewOntology() {
    this._openOntologyForm();
  }

  openEditOntology(iri: string) {
    this._openOntologyForm(iri);
  }

  private _openOntologyForm(iri?: string): void {
    this._dialog
      .open<OntologyFormComponent, OntologyFormProps, OntologyMetadata | null>(
        OntologyFormComponent,
        DspDialogConfig.dialogDrawerConfig(
          {
            ontologyIri: iri,
            projectIri: this.projectId,
          },
          true
        )
      )
      .afterClosed()
      .pipe(filter((result): result is OntologyMetadata => !!result))
      .subscribe((created: OntologyMetadata) => {
        this._store.dispatch(new LoadOntologyAction(created.id, this.projectId, true));
      });
  }

  deleteCurrentOntology() {
    this._dialogService
      .afterConfirmation('Do you want to delete this data model ?')
      .pipe(
        switchMap(() =>
          this._dspApiConnection.v2.onto.deleteOntology({
            id: this.ontologyId,
            lastModificationDate: this.lastModificationDate,
          })
        )
      )
      .subscribe(() => {
        this._store.dispatch(new LoadProjectOntologiesAction(this.projectId));
      });
  }

  openAddNewProperty(propType: DefaultProperty, assignToClass?: ClassDefinition) {
    this._dialog
      .open<CreatePropertyFormDialogComponent, CreatePropertyFormDialogProps, boolean>(
        CreatePropertyFormDialogComponent,
        {
          data: { propType, resClass: assignToClass },
        }
      )
      .afterClosed()
      .subscribe(() => {
        this._store.dispatch(new LoadProjectOntologiesAction(this.projectId));
      });
  }

  openEditProperty(propDef: ResourcePropertyDefinitionWithAllLanguages, propType: DefaultProperty) {
    this._dialog
      .open<EditPropertyFormDialogComponent, PropertyInfoObject>(
        EditPropertyFormDialogComponent,
        DspDialogConfig.dialogDrawerConfig({
          propDef,
          propType,
        })
      )
      .afterClosed()
      .subscribe(() => {
        this._store.dispatch(new LoadOntologyAction(this.ontologyId, this.projectId, true));
      });
  }

  openEditResourceClass(resClass: ResourceClassDefinitionWithAllLanguages): void {
    this._dialog
      .open<EditResourceClassDialogComponent, EditResourceClassDialogProps, boolean>(
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
      )
      .afterClosed()
      .subscribe(event => {
        if (event === true) {
          this._store.dispatch(new LoadOntologyAction(this.ontologyId, this.projectUuid, true));
        }
      });
  }

  createResourceProperty2(propertyData: CreatePropertyData) {
    //     this._oes.createResourceProperty(this.getCreateResourceProperty(this.form, this.data.propType), this.data.resClass);
    const createResProp = this.getCreateResourceProperty(propertyData);
    this._createResourceProperty(createResProp, propertyData.classDef);
  }

  getCreateResourceProperty(data: CreatePropertyData): CreateResourceProperty {
    const createResProp = new CreateResourceProperty();
    createResProp.name = data.name;
    createResProp.label = data.labels;
    createResProp.comment = data.comments;
    createResProp.guiElement = data.propType.guiEle;
    createResProp.subPropertyOf = [data.propType.subPropOf];

    if (data.guiAttribute) {
      createResProp.guiAttributes = this.getGuiAttribute(data.guiAttribute, data.propType);
    }

    if (
      data.classDef &&
      data.guiAttribute &&
      [Constants.HasLinkTo, Constants.IsPartOf].includes(data.propType.subPropOf)
    ) {
      createResProp.objectType = data.guiAttribute;
      createResProp.subjectType = data.classDef.id;
    } else {
      createResProp.objectType = data.propType.objectType;
    }

    if ([Constants.HasLinkTo, Constants.IsPartOf].includes(data.propType.subPropOf) && data.guiAttribute) {
      createResProp.objectType = data.guiAttribute;
      createResProp.subjectType = data.classDef?.id || '';
    } else {
      createResProp.objectType = data.propType.objectType || '';
    }
    return createResProp;
  }

  private getGuiAttribute(guiAttr: string, propType: DefaultProperty): string[] | undefined {
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

  private _createResourceProperty(resProp: CreateResourceProperty, assignToClass?: ClassDefinition) {
    this._dspApiConnection.v2.onto
      .createResourceProperty(this._getOntologyForCreateProperty(resProp))
      .pipe(take(1))
      .subscribe((response: ResourcePropertyDefinitionWithAllLanguages) => {
        if (assignToClass) {
          this.assignPropertyToClass(response.id, assignToClass);
        } else {
          this._store.dispatch(new LoadOntologyAction(this.ontologyId, this.projectId, true));
        }
      });
  }

  assignPropertyToClass(propertyId: string, classDefinition: ClassDefinition, position?: number) {
    const updateOnto = this._getUpdateOntologyForPropertyAssignment(propertyId, classDefinition, position);
    this._dspApiConnection.v2.onto
      .addCardinalityToResourceClass(updateOnto)
      .pipe(take(1))
      .subscribe((res: ResourceClassDefinitionWithAllLanguages) => {
        this._store.dispatch(new LoadProjectOntologiesAction(this.projectId));
      });
  }

  // Todo:  get the property per class from a centrtalised store, remove by performing the update, populate the store
  removePropertyFromClass(
    property: ResourcePropertyDefinitionWithAllLanguages,
    resourceClass: ClassDefinition,
    currentOntologyPropertiesToDisplay: PropToDisplay[]
  ) {
    this._store.dispatch(new RemovePropertyAction(property, resourceClass, currentOntologyPropertiesToDisplay));
    this._store.dispatch(new LoadProjectOntologiesAction(this.projectId));
  }

  updateProperty(formData: PropertyData) {
    const updates: Observable<any>[] = [];
    /*
    if (formData.labels.length) {
      updates.push(this.updatePropertyLabels(formData.propType, labels));
    }

    if (comments.length) {
      updates.push(this.updatePropertyComments(id, comments));
    }

    if (updates.length === 0) {
      return of(); // or throwError or EMPTY depending on your needs
    } */

    return concat(...updates); // runs each one sequentially
  }

  updatePropertyLabels(
    id: string,
    labels: StringLiteralV2[]
  ): Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError> {
    const updateLabel = new UpdateResourcePropertyLabel();
    updateLabel.id = id;
    updateLabel.labels = labels;
    const onto = this._getUpdateOntology<UpdateResourcePropertyLabel>(updateLabel);
    return this._updateResourceProperty(onto);
  }

  updatePropertyComments(
    id: string,
    comments: StringLiteralV2[]
  ): Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError> {
    const updateComment = new UpdateResourcePropertyComment();
    updateComment.id = id;
    updateComment.comments = comments;
    const onto = this._getUpdateOntology<UpdateResourcePropertyComment>(updateComment);
    return this._updateResourceProperty(onto);
  }

  updatePropertyGuiElement(
    id: string,
    guiElement: string,
    guiAttributes: string[]
  ): Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError> {
    const updateGuiElement = new UpdateResourcePropertyGuiElement();
    updateGuiElement.id = id;
    updateGuiElement.guiElement = guiElement;
    updateGuiElement.guiAttributes = guiAttributes;

    const onto = this._getUpdateOntology<UpdateResourcePropertyGuiElement>(updateGuiElement);
    return this._updateResourceProperty(onto);
  }

  private _updateResourceProperty(
    updateOntology: UpdateOntology<
      UpdateResourcePropertyGuiElement | UpdateResourcePropertyLabel | UpdateResourcePropertyComment
    >
  ): Observable<ResourcePropertyDefinitionWithAllLanguages> {
    return this._dspApiConnection.v2.onto.updateResourceProperty(updateOntology).pipe(
      filter((result): result is ResourcePropertyDefinitionWithAllLanguages => !!result),
      tap(() => this._store.dispatch(new LoadOntologyAction(this.ontologyId, this.projectId, true)))
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
        this._store.dispatch(new SetCurrentProjectOntologyPropertiesAction(this.projectUuid));
      });
  }

  deleteResourceClass(resClassIri: string) {
    this._dialogService
      .afterConfirmation('Do you want to delete this resource class?')
      .pipe(
        switchMap(() =>
          this._dspApiConnection.v2.onto.deleteResourceClass({
            id: resClassIri,
            lastModificationDate: this.lastModificationDate,
          })
        )
      )
      .subscribe(() => {
        this._store.dispatch(new LoadOntologyAction(this.ontologyId, this.projectId, true));
      });
  }

  canDeleteResourceClass(classId: string): Observable<CanDoResponse | ApiResponseError> {
    return this._dspApiConnection.v2.onto.canDeleteResourceClass(classId);
  }

  deleteProperty(iri: string) {
    this._dialogService
      .afterConfirmation('Do you want to delete this property?')
      .pipe(
        switchMap(() =>
          this._dspApiConnection.v2.onto.deleteResourceProperty({
            id: iri,
            lastModificationDate: this.lastModificationDate,
          })
        )
      )
      .subscribe(() => {
        this._store.dispatch(new SetCurrentProjectOntologyPropertiesAction(this.projectUuid));
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

  updateCardinalitiesOfResourceClass(classId: string, cardinalities: IHasProperty[] = []) {
    const updateResourceClassCard = this._getUpdateResourceClassCardinality(classId, cardinalities);
    this._updateCardinalityOfResourceClass(updateResourceClassCard);
  }

  private _updateCardinalityOfResourceClass(classCardinality: UpdateResourceClassCardinality) {
    const updateOntology = this._getUpdateOntology<UpdateResourceClassCardinality>(classCardinality);
    this._dspApiConnection.v2.onto
      .replaceCardinalityOfResourceClass(updateOntology)
      .pipe(take(1))
      .subscribe(response => {
        this._store.dispatch(new LoadOntologyAction(this.ontologyId, this.projectUuid, true));
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

  private _getOntologyForCreateProperty(resProp: CreateResourceProperty): UpdateOntology<CreateResourceProperty> {
    const updateOnto = new UpdateOntology<CreateResourceProperty>();

    updateOnto.id = this.ontologyId;
    updateOnto.lastModificationDate = this.lastModificationDate;
    updateOnto.entity = resProp;
    return updateOnto;
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
