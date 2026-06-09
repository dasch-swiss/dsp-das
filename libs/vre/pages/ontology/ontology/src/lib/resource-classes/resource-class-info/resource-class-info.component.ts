import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDrag, CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
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
import { combineLatest, filter, map, Observable, switchMap, take } from 'rxjs';
import {
  EditResourceClassDialogComponent,
  EditResourceClassDialogProps,
} from '../../forms/resource-class-form/edit-resource-class-dialog.component';
import { PROPERTY_LIBRARY_DROP_LIST_ID } from '../../ontology-editor-shell/property-library-drop-list';
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

  /** Static ID of the property-library drop list — used as the template's `cdkDropListConnectedTo`. */
  readonly propertyLibraryDropListId = PROPERTY_LIBRARY_DROP_LIST_ID;

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
   * Hover-time gate for the unified drop list.
   * - Same container → internal reorder always accepted.
   * - Cross-container (library → card) → reject when the property is
   *   already in this class's `propertiesList`. Returning `false` prevents
   *   CDK from rendering the insertion placeholder, giving the user a
   *   natural "invalid target" affordance (cursor not-allowed + no drop).
   *
   * Declared as an arrow-bound class field so `this` is preserved when CDK
   * invokes the predicate.
   */
  canAcceptDrop = (drag: CdkDrag, drop: CdkDropList): boolean => {
    if (drag.dropContainer === drop) {
      // eslint-disable-next-line no-console
      console.debug('[dnd] canAcceptDrop same-container -> true', { class: this.resourceClass.id });
      return true;
    }
    const data = drag.data as PropertyInfo | undefined;
    if (!data) {
      // eslint-disable-next-line no-console
      console.debug('[dnd] canAcceptDrop no-data -> false', { class: this.resourceClass.id });
      return false;
    }
    const alreadyOn = this.resourceClass.iHasProperties.some(p => p.propertyIndex === data.propDef.id);
    // eslint-disable-next-line no-console
    console.debug('[dnd] canAcceptDrop cross-container', {
      class: this.resourceClass.id,
      property: data.propDef.id,
      alreadyOn,
      accept: !alreadyOn,
    });
    return !alreadyOn;
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
   * Unified drop handler for the card's property list.
   * - Same container → reorder existing properties (persist via gui-order).
   * - Different container (drag from property library) → assign the
   *   property at the dropped index, then persist the new gui-order.
   */
  onPropertyDropped(event: CdkDragDrop<ClassPropertyInfo[], unknown, ClassPropertyInfo | PropertyInfo>): void {
    // eslint-disable-next-line no-console
    console.debug('[dnd] onPropertyDropped', {
      class: this.resourceClass.id,
      sameContainer: event.previousContainer === event.container,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      itemData: event.item.data,
    });
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) return;
      moveItemInArray(this.resourceClass.properties, event.previousIndex, event.currentIndex);
      const updated = this.resourceClass.properties.map((p, index) => ({
        ...p.iHasProperty,
        guiOrder: index + 1,
      }));
      this._oes.updateGuiOrderOfClassProperties(this.resourceClass.id, updated);
      return;
    }
    const prop = event.item.data as PropertyInfo;
    this._assignAtPosition(prop, event.currentIndex);
  }

  // Diagnostic handlers — remove once drag-and-drop is confirmed working.
  onDropListEntered(event: CdkDragEnter<unknown, unknown>): void {
    // eslint-disable-next-line no-console
    console.debug('[dnd] dropList entered', {
      class: this.resourceClass.id,
      currentIndex: event.currentIndex,
      itemData: event.item.data,
    });
  }

  onDropListExited(event: CdkDragExit<unknown, unknown>): void {
    // eslint-disable-next-line no-console
    console.debug('[dnd] dropList exited', { class: this.resourceClass.id, itemData: event.item.data });
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
   * Assign a property from the library to this class, then reorder so the
   * new property lands at `index`. The assign call appends with
   * `guiOrder = max + 1`; the post-assign reorder reads the FRESHLY-
   * reloaded class list (not `this.resourceClass`, which is still the
   * old Input reference at the point the subscribe-next runs) and
   * persists a new gui-order with the moved entry.
   */
  private _assignAtPosition(prop: PropertyInfo, index: number): void {
    const propertyLabel = prop.propDef.label ?? prop.propDef.id;
    const classLabel = this.resourceClass.label || this.resourceClass.id;
    const classId = this.resourceClass.id;

    this._oes
      .assignPropertyToClass$(prop.propDef.id, this.resourceClass.resourceClassDefinition)
      .pipe(
        // Wait for the next currentOntologyClasses$ emission that
        // contains the new property on this class. assignPropertyToClass$
        // triggers _loadOntology internally, so the next emission will
        // already include the assigned property at the end of the list.
        switchMap(() =>
          this._oes.currentOntologyClasses$.pipe(
            map(classes => classes.find(c => c.id === classId)),
            filter(
              (cls): cls is ResourceClassInfo =>
                !!cls && cls.properties.some(p => p.iHasProperty.propertyIndex === prop.propDef.id)
            ),
            take(1)
          )
        ),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: refreshedClass => {
          const refreshedProps = refreshedClass.properties;
          const fromIdx = refreshedProps.findIndex(p => p.iHasProperty.propertyIndex === prop.propDef.id);
          if (fromIdx >= 0 && fromIdx !== index && index <= refreshedProps.length - 1) {
            // Build a new ordering by moving the just-assigned entry to
            // the dropped index without mutating the reactive snapshot.
            const reordered = refreshedProps.slice();
            moveItemInArray(reordered, fromIdx, index);
            const updated = reordered.map((p, i) => ({
              ...p.iHasProperty,
              guiOrder: i + 1,
            }));
            this._oes.updateGuiOrderOfClassProperties(classId, updated);
          }
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
