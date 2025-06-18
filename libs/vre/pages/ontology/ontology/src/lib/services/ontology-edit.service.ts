import { Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
  CreateOntology,
  OntologyMetadata,
  StringLiteral,
  UpdateResourceClassLabel,
  UpdateResourceClassComment,
} from '@dasch-swiss/dsp-js';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspApiConnectionToken, DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  LoadProjectOntologiesAction,
  OntologiesSelectors,
  ProjectsSelectors,
  RemoveProjectOntologyAction,
  SetCurrentOntologyAction,
  SetOntologyAction,
} from '@dasch-swiss/vre/core/state';
import { EditPropertyFormDialogComponent, PropertyEditData } from '@dasch-swiss/vre/ontology/ontology-properties';
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
import { BehaviorSubject, concat, defer, Observable, of } from 'rxjs';
import { filter, map, switchMap, take, tap, last, distinctUntilChanged } from 'rxjs/operators';
import {
  CreateResourceClassDialogComponent,
  CreateResourceClassDialogProps,
} from '../create-resource-class-dialog/create-resource-class-dialog.component';
import {
  EditResourceClassDialogComponent,
  EditResourceClassDialogProps,
} from '../edit-resource-class-dialog/edit-resource-class-dialog.component';
import { CreateOntologyData, OntologyData, UpdateOntologyData } from '../ontology-form/ontology-form.type';
import { UpdateOntologyT } from '../ontology.types';
import { MakeOntologyFor, OntologyContext } from './make-ontology-for';

@Injectable({ providedIn: 'root' })
export class OntologyEditService {
  private _currentOntologyInfo = new BehaviorSubject<OntologyMetadata | ReadOntology | null>(null);
  currentOntologyInfo$ = this._currentOntologyInfo.asObservable();

  private _currentOntology = new BehaviorSubject<ReadOntology | null>(null);
  currentOntology$ = this._currentOntology.asObservable();

  latestChangedItem = new BehaviorSubject<string | null>(null);

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

  currentOntologyProperties$ = this.currentOntology$.pipe(
    map(ontology => {
      if (ontology) {
        const props = ontology.getAllPropertyDefinitions() as ResourcePropertyDefinitionWithAllLanguages[];
        return this._sortingService
          .keySortByAlphabetical(props, 'label')
          .filter(resProp => resProp.objectType !== Constants.LinkValue && !resProp.subjectType?.includes('Standoff'));
      }
      return [];
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

  private _canDeletePropertyMap = new Map<string, CanDoResponse>();

  get projectId(): string {
    return this._store.selectSnapshot(ProjectsSelectors.currentProject)!.id;
  }

  get projectShort(): string {
    return this._store.selectSnapshot(ProjectsSelectors.currentProject)!.shortname;
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
    this._updateCurrentOntologyInStoreIfNeeded(currentOntology);
  }

  get ctx(): OntologyContext {
    return {
      ontologyId: this.ontologyId,
      lastModificationDate: this.lastModificationDate,
    };
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
      this._currentOntologyInfo.next(ontologyFromStore);
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
        this._updateCurrentOntologyInStoreIfNeeded(onto);
      });
  }

  private _updateCurrentOntologyInStoreIfNeeded(ontology: ReadOntology) {
    const currentOntologyInStore = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
    if (
      !currentOntologyInStore ||
      currentOntologyInStore.id !== ontology.id ||
      currentOntologyInStore.lastModificationDate !== ontology.lastModificationDate
    ) {
      this._store.dispatch(new SetOntologyAction(ontology, this.projectId));
      this._store.dispatch(new SetCurrentOntologyAction(ontology));
    }
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

  createOntology$({ name, label, comment }: CreateOntologyData) {
    this._isTransacting.next(true);
    const createOntology = {
      attachedToProject: this.projectId,
      label: `${this.projectShort}:${label}`,
      name,
      comment,
    } as CreateOntology;

    return this._dspApiConnection.v2.onto.createOntology(createOntology).pipe(
      tap(onto => {
        this._afterOntologyChange(onto);
      })
    );
  }

  updateOntology$({ id, label, comment }: UpdateOntologyData) {
    this._isTransacting.next(true);
    const updateOntology = {
      id,
      lastModificationDate: this.lastModificationDate,
      label,
      comment,
    };

    return this._dspApiConnection.v2.onto.updateOntology(updateOntology).pipe(
      tap(onto => {
        this._afterOntologyChange(onto);
      })
    );
  }

  deleteOntology$(id: string) {
    return this._dialogService.afterConfirmation('Do you want to delete this data model ?').pipe(
      switchMap(_del => {
        return this._dspApiConnection.v2.onto
          .deleteOntology({
            id,
            lastModificationDate: this.lastModificationDate,
          })
          .pipe(
            tap(() => {
              this._store.dispatch(new RemoveProjectOntologyAction(id, this.projectId));
              this._store.dispatch(new LoadProjectOntologiesAction(this.projectId));
              this._currentOntology.next(null);
            })
          );
      })
    );
  }

  private updateResourceClassLabels$(id: string, labels: StringLiteral[]) {
    return defer(() => {
      const upd = new UpdateResourceClassLabel();
      upd.id = id;
      upd.labels = labels;
      return this._updateResourceClass$(this._getUpdateOntology(upd));
    });
  }

  private updateResourceClassComments$(id: string, comments: StringLiteral[]) {
    return defer(() => {
      const upd = new UpdateResourceClassComment();
      upd.id = id;
      upd.comments = comments;
      return this._updateResourceClass$(this._getUpdateOntology(upd));
    });
  }

  private _deleteResourceComment$(id: string) {
    return this._dspApiConnection.v2.onto
      .deleteResourceClassComment({
        id,
        lastModificationDate: this.lastModificationDate,
      })
      .pipe(
        tap(deleteCommentResponse => {
          this.lastModificationDate = deleteCommentResponse.lastModificationDate;
        })
      );
  }

  openAddNewProperty(propType: DefaultProperty, assignToClass?: ClassDefinition) {
    const dialogRef = this._dialog.open<EditPropertyFormDialogComponent, PropertyInfoObject, PropertyEditData>(
      EditPropertyFormDialogComponent,
      {
        data: { propType },
      }
    );

    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter((result): result is PropertyEditData => !!result),
        switchMap(propertyData => this._createResourceProperty$(propertyData))
      )
      .subscribe(propDef => {
        if (assignToClass) {
          this.lastModificationDate = propDef.lastModificationDate;
          this.assignPropertyToClass(propDef.id, assignToClass);
        } else {
          this._afterTransaction(propDef.id);
        }
      });
  }

  openEditProperty(propDef: ResourcePropertyDefinitionWithAllLanguages, propType: DefaultProperty) {
    const propertyData = {
      id: propDef.id,
      propType,
      name: propDef.id?.split('#').pop() || '',
      label: propDef.labels,
      comment: propDef.comments,
      guiElement: propDef.guiElement,
      guiAttribute: propDef.guiAttributes[0],
      objectType: propDef.objectType,
    };
    const dialogRef = this._dialog.open<EditPropertyFormDialogComponent, PropertyEditData, PropertyEditData>(
      EditPropertyFormDialogComponent,
      DspDialogConfig.dialogDrawerConfig(propertyData)
    );

    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter((result): result is PropertyEditData => !!result),
        switchMap(pData => {
          return this._updateProperty$(propDef.id, pData).pipe(take(1));
        })
      )
      .subscribe();
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

  private _createResourceProperty$(propertyData: PropertyEditData) {
    this._isTransacting.next(true);
    const onto = MakeOntologyFor.createProperty(this.ctx, propertyData);
    return this._dspApiConnection.v2.onto.createResourceProperty(onto).pipe(take(1));
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

    const updateOntology = MakeOntologyFor.updateResourceClassCardinality(this.ctx, classDefinition.id, [propCard]);
    this._dspApiConnection.v2.onto
      .addCardinalityToResourceClass(updateOntology)
      .pipe(take(1))
      .subscribe((res: ResourceClassDefinitionWithAllLanguages) => {
        this._afterTransaction(propertyId);
      });
  }

  removePropertyFromClass(property: IHasProperty, classId: string) {
    this._isTransacting.next(true);
    const updateOntology = MakeOntologyFor.updateResourceClassCardinality(this.ctx, classId, [property]);
    this._dspApiConnection.v2.onto
      .deleteCardinalityFromResourceClass(updateOntology)
      .pipe(take(1))
      .subscribe(() => {
        this._afterTransaction(classId);
      });
  }

  private _updateProperty$(id: string, propertyData: PropertyEditData) {
    const updates: Observable<ResourcePropertyDefinitionWithAllLanguages | ApiResponseError>[] = [];

    if (propertyData.label !== undefined) {
      updates.push(this._updatePropertyLabels$(id, propertyData.label));
    }

    if (propertyData.comment !== undefined) {
      updates.push(this._updatePropertyComments$(id, propertyData.comment));
    }

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

  private _updatePropertyLabels$(id: string, labels: StringLiteralV2[]) {
    return defer(() => {
      const upd = new UpdateResourcePropertyLabel();
      upd.id = id;
      upd.labels = labels;
      return this._updateResourceProperty$(this._getUpdateOntology(upd));
    });
  }

  private _updatePropertyComments$(id: string, comments: StringLiteralV2[]) {
    return defer(() => {
      const upd = new UpdateResourcePropertyComment();
      upd.id = id;
      upd.comments = comments;
      return this._updateResourceProperty$(this._getUpdateOntology(upd));
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

  private _updateResourceClass$(updateOntology: UpdateOntology<UpdateResourceClassLabel | UpdateResourceClassComment>) {
    return this._dspApiConnection.v2.onto.updateResourceClass(updateOntology).pipe(
      tap(resClass => {
        this.lastModificationDate = resClass.lastModificationDate;
      })
    );
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
          this._afterTransaction(resClassInfo.iri);
        }
      });
  }

  canDeleteResourceClass$(classId: string): Observable<CanDoResponse | ApiResponseError> {
    return this._dspApiConnection.v2.onto.canDeleteResourceClass(classId);
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

  deleteProperty(id: string) {
    this._dialogService
      .afterConfirmation('Do you want to delete this property?')
      .pipe(
        take(1),
        switchMap(() =>
          this._dspApiConnection.v2.onto.deleteResourceProperty({
            id,
            lastModificationDate: this.lastModificationDate,
          })
        )
      )
      .subscribe(() => {
        this._afterTransaction(id, `Successfully deleted ${id}.`);
      });
  }

  propertyCanBeRemovedFromClass$(propCard: IHasProperty, classId: string): Observable<CanDoResponse> {
    if (propCard.isInherited) {
      // no need to send a request to the server
      return of({ canDo: false, cannotDoReason: 'The property is inherited from another class' } as CanDoResponse);
    }
    const updateOntology = MakeOntologyFor.updateResourceClassCardinality(this.ctx, classId, [propCard]);
    return this._dspApiConnection.v2.onto.canDeleteCardinalityFromResourceClass(updateOntology);
  }

  updateGuiOrderOfClassProperties(classId: string, properties: IHasProperty[]) {
    this._isTransacting.next(true);
    const updateOntology = MakeOntologyFor.updateResourceClassCardinality(this.ctx, classId, properties);
    this._dspApiConnection.v2.onto
      .replaceGuiOrderOfCardinalities(updateOntology)
      .pipe(take(1))
      .subscribe(() => {
        this._afterTransaction(classId);
      });
  }

  updateCardinalitiesOfResourceClass(classId: string, properties: IHasProperty[] = []) {
    this._isTransacting.next(true);
    const updateOntology = MakeOntologyFor.updateResourceClassCardinality(this.ctx, classId, properties);
    this._dspApiConnection.v2.onto
      .replaceCardinalityOfResourceClass(updateOntology)
      .pipe(take(1))
      .subscribe(response => {
        this._afterTransaction(classId);
      });
  }

  private _getUpdateOntology<T extends UpdateOntologyT>(entity: T): UpdateOntology<T> {
    const onto = new UpdateOntology<T>();
    onto.id = this.ontologyId;
    onto.lastModificationDate = this.lastModificationDate;
    onto.entity = entity;
    return onto;
  }

  private _afterOntologyChange(ontology: OntologyMetadata) {
    this.lastModificationDate = ontology.lastModificationDate;
    this._currentOntologyInfo.next(ontology);
    this._isTransacting.next(false);
    this.latestChangedItem.next(ontology.id);
    this._store.dispatch(new LoadProjectOntologiesAction(this.projectId));
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
