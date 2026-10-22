import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, Inject, Input, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatList } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { ApiResponseError, CanDoResponse, IHasProperty, KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { StringifyStringLiteralPipe } from '@dasch-swiss/vre/ui/string-literal';
import { DialogService, TruncatePipe } from '@dasch-swiss/vre/ui/ui';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { combineLatest, map, Observable, switchMap, take } from 'rxjs';
import {
  EditResourceClassDialogComponent,
  EditResourceClassDialogProps,
} from '../../forms/resource-class-form/edit-resource-class-dialog.component';
import { ClassPropertyInfo, PropertyInfo, ResourceClassInfo } from '../../ontology.types';
import { OntologyEditService } from '../../services/ontology-edit.service';
import { OntologyEditorViewService } from '../../services/ontology-editor-view.service';
import { AddPropertyMenuComponent } from './add-property-menu.component';
import { PropertyItemComponent } from './property-item.component';

@Component({
  selector: 'app-resource-class-info',
  templateUrl: './resource-class-info.component.html',
  styleUrls: ['./resource-class-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AddPropertyMenuComponent,
    AsyncPipe,
    CdkDropList,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatIcon,
    MatIconButton,
    MatList,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    PropertyItemComponent,
    StringifyStringLiteralPipe,
    TranslatePipe,
    TruncatePipe,
  ],
})
export class ResourceClassInfoComponent {
  @Input({ required: true }) resourceClass!: ResourceClassInfo;

  hasProjectAdminRights$ = this._projectPageService.hasProjectAdminRights$;

  classHovered = false;
  menuOpen = false;

  classCanBeDeleted = false;

  /**
   * Disable drops while an ontology transaction is in flight or the user
   * lacks project-admin rights. Bound to `[cdkDropListDisabled]`.
   */
  readonly isDropDisabled$ = combineLatest([this._oes.isTransacting$, this._view.isEditingEnabled$]).pipe(
    map(([transacting, editing]) => transacting || !editing)
  );

  trackByPropToDisplayFn = (index: number, item: ClassPropertyInfo) => `${index}-${item.propDef.id}`;

  protected readonly _translate = inject(TranslateService);
  private readonly _announcer = inject(LiveAnnouncer);
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    @Inject(DspApiConnectionToken) private readonly _dspApiConnection: KnoraApiConnection,
    private _viewContainerRef: ViewContainerRef,
    private readonly _clipboard: Clipboard,
    private readonly _dialog: MatDialog,
    private readonly _dialogService: DialogService,
    private readonly _notification: NotificationService,
    private readonly _oes: OntologyEditService,
    private readonly _projectPageService: ProjectPageService,
    private readonly _view: OntologyEditorViewService
  ) {}

  /**
   * True while a library property is dragged that cannot be added to this
   * class, either because the class already has it or because the
   * property's subjectType restricts it to another class.
   */
  readonly isDropBlocked$ = this._view.draggedProperty$.pipe(
    map(property => property !== null && !this._acceptsLibraryProperty(property))
  );

  /**
   * Enter predicate of the card's property list. cdkDropListGroup connects
   * the list to the library and to every other card, so it accepts:
   * - reorders within this list,
   * - library properties this class can take (see `isDropBlocked$`).
   * Property rows dragged from another card carry no `propDef` data and are
   * rejected; moving a property between classes is not supported.
   */
  canAcceptDrop = (drag: CdkDrag, drop: CdkDropList): boolean => {
    if (drag.dropContainer === drop) return true;
    return this._isLibraryProperty(drag.data) && this._acceptsLibraryProperty(drag.data);
  };

  setCanBeDeleted() {
    this._canDeleteResourceClass$(this.resourceClass.id)
      .pipe(take(1))
      .subscribe(response => {
        if (response instanceof ApiResponseError) {
          return;
        }
        this.classCanBeDeleted = response?.canDo;
      });
  }

  editResourceClassInfo() {
    this._dialog.open<EditResourceClassDialogComponent, EditResourceClassDialogProps>(
      EditResourceClassDialogComponent,
      {
        ...DspDialogConfig.mediumDialog({
          labels: this.resourceClass.labels,
          data: this.resourceClass.updateResourceClassData,
        }),
        viewContainerRef: this._viewContainerRef,
      }
    );
  }

  deleteResourceClass() {
    this._dialogService
      .afterConfirmation(this._translate.instant('pages.ontology.resourceClassInfo.deleteConfirmation'))
      .pipe(switchMap(_del => this._oes.deleteResourceClass$(this.resourceClass.id)))
      .subscribe();
  }

  /**
   * Reorders within the card, or adds a library property at the position
   * it was dropped (the placeholder's position).
   */
  onPropertyDropped(event: CdkDragDrop<ClassPropertyInfo[], unknown, PropertyInfo | undefined>): void {
    if (event.previousContainer !== event.container) {
      if (this._isLibraryProperty(event.item.data)) {
        this._assignAt(event.item.data, event.currentIndex);
      }
      return;
    }
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.resourceClass.properties, event.previousIndex, event.currentIndex);
    const updated = this.resourceClass.properties.map((p, index) => ({
      ...p.iHasProperty,
      guiOrder: index + 1,
    }));
    this._oes.updateGuiOrderOfClassProperties(this.resourceClass.id, updated);
  }

  onCardinalityChange(updatedIHasProperty: IHasProperty) {
    const properties: IHasProperty[] = this.resourceClass.properties.map(p => p.iHasProperty);
    properties.map(p => (p.propertyIndex === updatedIHasProperty.propertyIndex ? { ...p, ...updatedIHasProperty } : p));
    this._oes.updatePropertiesOfResourceClass(this.resourceClass.id, properties);
  }

  openInDatabrowser() {
    const projectUuid = this._projectPageService.currentProjectUuid;
    const ontologyName = OntologyService.getOntologyNameFromIri(this._oes.ontologyId || '');
    const dataBrowserRoute = `/${RouteConstants.project}/${projectUuid}/${RouteConstants.data}/${ontologyName}/${this.resourceClass.name}`;
    window.open(dataBrowserRoute, '_blank');
  }

  copyResourceClassId() {
    this._clipboard.copy(this.resourceClass.id);
    this._notification.openSnackBar(this._translate.instant('pages.ontology.resourceClassInfo.idCopied'));
  }

  private _isLibraryProperty(data: unknown): data is PropertyInfo {
    return !!data && typeof data === 'object' && 'propDef' in data;
  }

  private _acceptsLibraryProperty(property: PropertyInfo): boolean {
    const alreadyAssigned = this.resourceClass.iHasProperties.some(p => p.propertyIndex === property.propDef.id);
    return !alreadyAssigned && this._oes.canAssignPropertyToClass(property, this.resourceClass.resourceClassDefinition);
  }

  private _assignAt(prop: PropertyInfo, index: number): void {
    const propertyLabel = prop.propDef.label ?? prop.propDef.id;
    const classLabel = this.resourceClass.label || this.resourceClass.id;

    this._oes
      .assignPropertyToClass$(prop.propDef.id, this.resourceClass.resourceClassDefinition, index)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._announcer.announce(
            this._translate.instant('pages.ontology.editor.a11y.assigned', { propertyLabel, classLabel }),
            'assertive'
          );
          this._notification.openSnackBar(
            this._translate.instant('pages.ontology.editor.notify.assigned', { propertyLabel, classLabel })
          );
        },
        error: () => {
          this._announcer.announce(
            this._translate.instant('pages.ontology.editor.a11y.assignFailed', { propertyLabel, classLabel }),
            'assertive'
          );
          this._notification.openSnackBar(
            this._translate.instant('pages.ontology.editor.notify.assignFailed', { propertyLabel, classLabel }),
            'error'
          );
        },
      });
  }

  private _canDeleteResourceClass$(classId: string): Observable<CanDoResponse | ApiResponseError> {
    return this._dspApiConnection.v2.onto.canDeleteResourceClass(classId);
  }
}
