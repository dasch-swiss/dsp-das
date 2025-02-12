import { EventEmitter, Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ApiResponseError,
  CanDoResponse,
  ClassDefinition,
  CreateResourceProperty,
  IHasProperty,
  KnoraApiConnection,
  ReadOntology,
  ReadProject,
  ResourceClassDefinitionWithAllLanguages,
  ResourcePropertyDefinitionWithAllLanguages,
  UpdateOntology,
  UpdateResourceClassCardinality,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, DspDialogConfig } from '@dasch-swiss/vre/core/config';
import {
  ClearCurrentOntologyAction,
  LoadOntologyAction,
  OntologiesSelectors,
  ProjectsSelectors,
  PropToDisplay,
  RemovePropertyAction,
} from '@dasch-swiss/vre/core/state';
import {
  CreatePropertyFormDialogComponent,
  CreatePropertyFormDialogProps,
  EditPropertyFormDialogComponent,
  EditPropertyFormDialogProps,
} from '@dasch-swiss/vre/resource-editor/property-form';
import {
  DefaultClass,
  DefaultProperty,
  OntologyService,
  PropertyInfoObject,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { MultiLanguages } from '@dasch-swiss/vre/ui/string-literal';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';
import {
  CreateResourceClassDialogProps,
  CreateResourceClassDialogComponent,
} from '../create-resource-class-dialog/create-resource-class-dialog.component';
import {
  EditResourceClassDialogComponent,
  EditResourceClassDialogProps,
} from '../edit-resource-class-dialog/edit-resource-class-dialog.component';
import { OntologyFormComponent } from '../ontology-form/ontology-form.component';
import { OntologyFormProps } from '../ontology-form/ontology-form.type';

@Injectable({ providedIn: 'root' })
export class OntologyEditService {
  ontologyUpdated = new EventEmitter<void>();

  private _currentProject$ = this._store.select(ProjectsSelectors.currentProject);
  private _currentProject?: ReadProject;

  private _currentOntology$ = this._store.select(OntologiesSelectors.currentOntology);
  private _currentOntology: ReadOntology | null = null;

  get projectId(): string {
    return this._currentProject?.id || '';
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
    private _actions$: Actions,
    private _dialog: MatDialog,
    private _dialogService: DialogService,
    private _ontologyService: OntologyService,
    private _store: Store
  ) {
    this._currentProject$.pipe(takeUntil(this.ontologyUpdated)).subscribe(project => {
      this._currentProject = project;
    });

    this._currentOntology$.pipe(takeUntil(this.ontologyUpdated)).subscribe(onto => {
      this._currentOntology = onto;
    });
  }

  openOntologyForm(iri = ''): void {
    this._dialog
      .open<OntologyFormComponent, OntologyFormProps, true>(
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
      .subscribe(event => {
        if (event === true) {
          console.log('ontology created');
        }
      });
  }

  openAddNewProperty(propType: DefaultProperty, classDefinition?: ClassDefinition) {
    this._dialog.open<CreatePropertyFormDialogComponent, CreatePropertyFormDialogProps, boolean>(
      CreatePropertyFormDialogComponent,
      {
        data: {
          propertyInfo: { propType },
          resClass: classDefinition,
        },
      }
    );
  }

  openEditProperty(data: PropertyInfoObject) {
    this._dialog
      .open<EditPropertyFormDialogComponent, EditPropertyFormDialogProps>(
        EditPropertyFormDialogComponent,
        DspDialogConfig.dialogDrawerConfig({
          ontology: this._currentOntology,
          lastModificationDate: this.lastModificationDate,
          propertyInfo: data,
        })
      )
      .afterClosed()
      .subscribe(() => {
        console.log('property updated');
      });
  }

  openEditResourceClass(resClass: ResourceClassDefinitionWithAllLanguages): void {
    this._dialog
      .open<EditResourceClassDialogComponent, EditResourceClassDialogProps, boolean>(
        EditResourceClassDialogComponent,
        DspDialogConfig.dialogDrawerConfig({
          id: resClass.id,
          title: resClass.label,
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
          console.log('resource class updated');
        }
      });
  }

  // CRUD OPS

  createResourceProperty(resProp: CreateResourceProperty, resClass?: ClassDefinition) {
    this._dspApiConnection.v2.onto
      .createResourceProperty(this._getOntologyForCreateProperty(resProp))
      .pipe(take(1))
      .subscribe((response: ResourcePropertyDefinitionWithAllLanguages | ApiResponseError) => {
        if (response instanceof ApiResponseError) {
          console.error('Error creating property', response);
          return;
        }
        if (resClass) {
          this.assignPropertyToClass(response.id, resClass, response.lastModificationDate);
        } else {
          console.log('no class to assign to, refreshing ontology');
          this.ontologyUpdated.emit();
        }
      });
  }

  assignPropertyToClass(propertyId: string, classDefinition: ClassDefinition, lastModDate?: string, position?: number) {
    const updateOnto = this._getUpdateOntologyForPropertyAssignment(propertyId, classDefinition, lastModDate, position);
    this._dspApiConnection.v2.onto
      .addCardinalityToResourceClass(updateOnto)
      .pipe(take(1))
      .subscribe((res: ResourceClassDefinitionWithAllLanguages | ApiResponseError) => {
        if (res instanceof ResourceClassDefinitionWithAllLanguages) {
          this.ontologyUpdated.emit();
        } else {
          console.error('Error assigning property to class', res);
        }
      });
  }

  removePropertyFromClass(
    property: ResourcePropertyDefinitionWithAllLanguages,
    resourceClass: ClassDefinition,
    currentOntologyPropertiesToDisplay: PropToDisplay[]
  ) {
    this._store.dispatch(new RemovePropertyAction(property, resourceClass, currentOntologyPropertiesToDisplay));
    this._actions$
      .pipe(ofActionSuccessful(RemovePropertyAction))
      .pipe(take(1))
      .subscribe(res => {
        console.log('property removed from class', res);
      });
  }

  createResourceClass(resClassInfo: DefaultClass): void {
    this._dialog
      .open<CreateResourceClassDialogComponent, CreateResourceClassDialogProps, null>(
        CreateResourceClassDialogComponent,
        DspDialogConfig.dialogDrawerConfig({
          id: resClassInfo.iri,
          title: resClassInfo.label,
          ontologyId: this.ontologyId,
          lastModificationDate: this.lastModificationDate,
        })
      )
      .afterClosed()
      .subscribe(event => {
        if (event !== false) {
          console.log('resource class created');
        }
      });
  }

  createNewOntology() {
    this._dialog.open<OntologyFormComponent, OntologyFormProps, null>(
      OntologyFormComponent,
      DspDialogConfig.dialogDrawerConfig(
        {
          ontologyIri: null,
          projectIri: this.projectId,
        },
        true
      )
    );
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
        console.log('ontology deleted');
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
        console.log('resource class deleted');
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
        this._store.dispatch(new ClearCurrentOntologyAction());
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
    // get the ontology, the class and its properties
    const updateOntology = new UpdateOntology<UpdateResourceClassCardinality>();
    updateOntology.id = this.ontologyId;
    updateOntology.lastModificationDate = this.lastModificationDate;
    updateOntology.entity = classCardinality;
    this._dspApiConnection.v2.onto
      .replaceCardinalityOfResourceClass(updateOntology)
      .pipe(
        tap(() => {
          this._store.dispatch(new LoadOntologyAction(this.ontologyId, this.projectId, true));
        }),
        take(1)
      )
      .subscribe(response => {});
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
}
