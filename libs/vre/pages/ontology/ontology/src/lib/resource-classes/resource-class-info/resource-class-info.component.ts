import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiResponseError, IHasProperty } from '@dasch-swiss/dsp-js';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { LocalizationService, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Store } from '@ngxs/store';
import { Subscription, switchMap, take } from 'rxjs';
import {
  EditResourceClassDialogComponent,
  EditResourceClassDialogProps,
} from '../../forms/resource-class-form/edit-resource-class-dialog.component';
import { UpdateResourceClassData } from '../../forms/resource-class-form/resource-class-form.type';
import { OntologyPageService } from '../../ontology-page.service';
import { ClassPropertyInfo, ResourceClassInfo } from '../../ontology.types';
import { OntologyEditService } from '../../services/ontology-edit.service';

@Component({
  selector: 'app-resource-class-info',
  templateUrl: './resource-class-info.component.html',
  styleUrls: ['./resource-class-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceClassInfoComponent implements OnInit, OnDestroy {
  @Input({ required: true }) resourceClass!: ResourceClassInfo;

  project$ = this._store.select(ProjectsSelectors.currentProject);

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  classHovered = false;
  menuOpen = false;

  classCanBeDeleted = false;
  subscription!: Subscription;
  expandClasses = true;

  get classLabel() {
    const lang = this._localizationService.getCurrentLanguage();
    const preferedLangLabel = this.resourceClass.labels.find(l => l.language === lang);
    return preferedLangLabel?.value || this.resourceClass.label || '';
  }

  get classComment() {
    const lang = this._localizationService.getCurrentLanguage();
    const preferedLangComment = this.resourceClass.comments.find(c => c.language === lang);
    return preferedLangComment?.value || this.resourceClass.comment || '';
  }

  trackByPropToDisplayFn = (index: number, item: ClassPropertyInfo) => `${index}-${item.propDef.id}`;

  constructor(
    public ops: OntologyPageService,
    private _clipboard: Clipboard,
    private _dialog: MatDialog,
    private _localizationService: LocalizationService,
    private _dialogService: DialogService,
    private _oes: OntologyEditService,
    private _store: Store,
    private _notification: NotificationService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscription = this.ops.expandClasses$.subscribe(expandClasses => {
      this.expandClasses = expandClasses;
      this._cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setCanBeDeleted() {
    this._oes
      .canDeleteResourceClass$(this.resourceClass.id)
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
      DspDialogConfig.mediumDialog({ title: this.classLabel, data: this.resourceClass.updateResourceClassData })
    );
  }

  deleteResourceClass() {
    this._dialogService
      .afterConfirmation('Do you want to delete this resource class ?')
      .pipe(switchMap(_del => this._oes.deleteResourceClass$(this.resourceClass.id)))
      .subscribe();
  }

  onPropertyDropped(event: CdkDragDrop<ClassPropertyInfo[]>) {
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
    const projectUuid = this._store.selectSnapshot(ProjectsSelectors.currentProjectsUuid);
    const ontologyName = OntologyService.getOntologyName(this._oes.ontologyId || '');
    const dataBrowserRoute = `/${RouteConstants.project}/${projectUuid}/${RouteConstants.ontology}/${ontologyName}/${this.resourceClass.name}`;
    window.open(dataBrowserRoute, '_blank');
  }

  copyResourceClassId() {
    this._clipboard.copy(this.resourceClass.id);
    this._notification.openSnackBar('Resource class ID copied to clipboard.');
  }
}
