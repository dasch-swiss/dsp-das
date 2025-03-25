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
  CreatePropertyFormDialogComponent,
  CreatePropertyFormDialogProps,
  EditPropertyFormDialogComponent,
  EditPropertyFormDialogProps,
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
import { Observable, of, Subject } from 'rxjs';
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

  openAddNewProperty(propType: DefaultProperty, classDefinition?: ClassDefinition) {
    this._dialog
      .open<CreatePropertyFormDialogComponent, CreatePropertyFormDialogProps, boolean>(
        CreatePropertyFormDialogComponent,
        {
          data: {
            propertyInfo: { propType },
            resClass: classDefinition,
          },
        }
      )
      .afterClosed()
      .subscribe(() => {
        this._store.dispatch(new LoadProjectOntologiesAction(this.projectId));
      });
  }

  openEditProperty(data: PropertyInfoObject) {
    this._dialog
      .open<EditPropertyFormDialogComponent, EditPropertyFormDialogProps>(
        EditPropertyFormDialogComponent,
        DspDialogConfig.dialogDrawerConfig({
          ontology: this._currentOntology!,
          lastModificationDate: this.lastModificationDate,
          propertyInfo: data,
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

  createResourceProperty(resProp: CreateResourceProperty, resClass?: ClassDefinition) {
    this._dspApiConnection.v2.onto
      .createResourceProperty(this._getOntologyForCreateProperty(resProp))
      .pipe(
        take(1),
        filter((result): result is ResourcePropertyDefinitionWithAllLanguages => !!result)
      )
      .subscribe((response: ResourcePropertyDefinitionWithAllLanguages) => {
        if (resClass) {
          this.assignPropertyToClass(response.id, resClass, response.lastModificationDate);
        } else {
          this._store.dispatch(new LoadOntologyAction(this.ontologyId, this.projectId, true));
        }
      });
  }

  assignPropertyToClass(propertyId: string, classDefinition: ClassDefinition, lastModDate?: string, position?: number) {
    const updateOnto = this._getUpdateOntologyForPropertyAssignment(propertyId, classDefinition, lastModDate, position);
    this._dspApiConnection.v2.onto
      .addCardinalityToResourceClass(updateOnto)
      .pipe(
        take(1),
        filter((result): result is ResourceClassDefinitionWithAllLanguages => !!result)
      )
      .subscribe((res: ResourceClassDefinitionWithAllLanguages) => {
        this._store.dispatch(new LoadProjectOntologiesAction(this.projectId));
      });
  }

  removePropertyFromClass(
    property: ResourcePropertyDefinitionWithAllLanguages,
    resourceClass: ClassDefinition,
    currentOntologyPropertiesToDisplay: PropToDisplay[]
  ) {
    this._store.dispatch(new RemovePropertyAction(property, resourceClass, currentOntologyPropertiesToDisplay));
    this._store.dispatch(new LoadProjectOntologiesAction(this.projectId));
  }

  updatePropertyLabels(
    id: string,
    labels: StringLiteralV2[]
  ): Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError> {
    const onto = this._getUpdateOntology<UpdateResourcePropertyLabel>(
      this._getUpdateProperty<UpdateResourcePropertyLabel>(id)
    );
    onto.entity.labels = labels;
    return this._updateResourceProperty(onto);
  }

  updatePropertyComments(
    id: string,
    comments: StringLiteralV2[]
  ): Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError> {
    const onto = this._getUpdateOntology<UpdateResourcePropertyComment>(
      this._getUpdateProperty<UpdateResourcePropertyComment>(id)
    );
    onto.entity.comments = comments;
    return this._updateResourceProperty(onto);
  }

  updatePropertyGuiElement(
    id: string,
    guiElement: string,
    guiAttributes: string[]
  ): Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError> {
    const onto = this._getUpdateOntology<UpdateResourcePropertyGuiElement>(
      this._getUpdateProperty<UpdateResourcePropertyGuiElement>(id)
    );
    onto.entity.guiElement = guiElement;
    onto.entity.guiAttributes = guiAttributes;
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

  private _getUpdateProperty<T extends UpdateEntityCommentOrLabel>(id: string) {
    return { id } as T;
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

  propertyCanBeRemovedFromClass(
    propCard: IHasProperty,
    classIri: string
  ): Observable<CanDoResponse | ApiResponseError> {
    // property can only be removed from class if it's not inherited from another prop or class
    if (propCard.isInherited) {
      const canDoRes = new CanDoResponse();
      canDoRes.canDo = false;
      canDoRes.cannotDoReason = 'The property is inherited from another class';
      return of(canDoRes);
    }

    const onto = new UpdateOntology<UpdateResourceClassCardinality>();
    onto.lastModificationDate = this.lastModificationDate;
    onto.id = this.ontologyId;

    const delCard = new UpdateResourceClassCardinality();
    delCard.id = classIri;

    delCard.cardinalities = [];
    delCard.cardinalities = [propCard];
    onto.entity = delCard;
    return this._dspApiConnection.v2.onto.canDeleteCardinalityFromResourceClass(onto);
  }

  updateCardinalityOfResourceClass(classCardinality: UpdateResourceClassCardinality) {
    const updateOntology = new UpdateOntology<UpdateResourceClassCardinality>();
    updateOntology.id = this.ontologyId;
    updateOntology.lastModificationDate = this.lastModificationDate;
    updateOntology.entity = classCardinality;
    this._dspApiConnection.v2.onto
      .replaceCardinalityOfResourceClass(updateOntology)
      .pipe(take(1))
      .subscribe(response => {
        this._store.dispatch(new LoadOntologyAction(this.ontologyId, this.projectUuid, true));
      });
  }

  private _getUpdateOntologyForPropertyAssignment(
    propertyId: string,
    classDefinition: ClassDefinition,
    lastModDate?: string,
    position?: number
  ): UpdateOntology<UpdateResourceClassCardinality> {
    const updateOnto = new UpdateOntology<UpdateResourceClassCardinality>();
    updateOnto.lastModificationDate = lastModDate || this.lastModificationDate;
    updateOnto.id = this.ontologyId;

    const updateCard = new UpdateResourceClassCardinality();
    updateCard.id = classDefinition.id;

    const guiOrder =
      position ||
      classDefinition.propertiesList.reduce((prev, current) => Math.max(prev, current.guiOrder ?? 0), 0) + 1;

    const propCard: IHasProperty = {
      propertyIndex: propertyId,
      cardinality: 1, // default: not required, not multiple
      guiOrder,
    };

    updateCard.cardinalities = [propCard];
    updateOnto.entity = updateCard;

    return updateOnto;
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
