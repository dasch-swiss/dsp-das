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
   * Predicate for the inner property-list cdkDropList: only accepts
   * drops that originated from the same list (i.e. internal reorder).
   * Rejects everything else -- cdkDropListGroup connects this list to
   * every other card and to the library, but those cross-container
   * drops are handled by the OUTER card-level cdkDropList below.
   */
  onlySameContainer = (drag: CdkDrag, drop: CdkDropList): boolean => drag.dropContainer === drop;

  /**
   * Predicate for the OUTER card-level cdkDropList: accepts ONLY
   * library->card drags (drag.data is a PropertyInfo carrying
   * `propDef`). Rejects:
   * - same-container drops (the inner reorder list handles those),
   * - cross-card class-to-class drags (drag.data has no `propDef`),
   * - properties already assigned to this class (duplicate guard).
   */
  canAcceptLibraryDrop = (drag: CdkDrag, drop: CdkDropList): boolean => {
    if (drag.dropContainer === drop) return false;
    const data = drag.data as PropertyInfo | undefined;
    if (!data || typeof data !== 'object' || !('propDef' in data)) {
      return false;
    }
    return !this.resourceClass.iHasProperties.some(p => p.propertyIndex === data.propDef.id);
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
   * Internal property reordering inside this class card. Connected to
   * itself only (enterPredicate `onlySameContainer`), so no cross-card
   * or library drag can ever reach this handler.
   */
  onPropertyDropped(event: CdkDragDrop<ClassPropertyInfo[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.resourceClass.properties, event.previousIndex, event.currentIndex);
    const updated = this.resourceClass.properties.map((p, index) => ({
      ...p.iHasProperty,
      guiOrder: index + 1,
    }));
    this._oes.updateGuiOrderOfClassProperties(this.resourceClass.id, updated);
  }

  /**
   * Outer card-level drop handler for library->card assignment. The
   * card's outer cdkDropList accepts only PropertyInfo drags from the
   * library (enterPredicate `canAcceptLibraryDrop`), so item.data here
   * is always a PropertyInfo. Position is not preserved -- a single
   * assignPropertyToClass$ call appends the property; users reorder
   * afterwards via the inner drag handle.
   */
  onLibraryDrop(event: CdkDragDrop<ResourceClassInfo, unknown, PropertyInfo>): void {
    this._assignAtPosition(event.item.data, event.currentIndex);
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

  /**
   * Assign a property from the library to this class. The assign call
   * appends with `guiOrder = max + 1`. A previous version of this
   * method chained a follow-up `replaceGuiOrderOfCardinalities` to land
   * the property at the user's dropped index, but the second request
   * race-collided with concurrent assigns from rapid drops -- the
   * server returned 400 "do not have cardinalities" because the
   * `lastModificationDate` and class snapshot used by the reorder were
   * stale relative to the in-flight assign. Drop position is no longer
   * persisted on library-drop; users can reorder afterwards via the
   * internal drag handle on the row, which is single-request and safe.
   */
  private _assignAtPosition(prop: PropertyInfo, _index: number): void {
    const propertyLabel = prop.propDef.label ?? prop.propDef.id;
    const classLabel = this.resourceClass.label || this.resourceClass.id;

    this._oes
      .assignPropertyToClass$(prop.propDef.id, this.resourceClass.resourceClassDefinition)
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
