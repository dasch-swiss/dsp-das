import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiResponseError, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ClassPropToDisplay, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import {
  DefaultResourceClasses,
  LocalizationService,
  OntologyService,
  PropertyInfoObject,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { EditResourceClassDialogComponent } from '../../forms/resource-class-form/edit-resource-class-dialog.component';
import { UpdateResourceClassData } from '../../forms/resource-class-form/resource-class-form.type';
import { OntologyEditService } from '../../services/ontology-edit.service';

@Component({
  selector: 'app-resource-class-info',
  templateUrl: './resource-class-info.component.html',
  styleUrls: ['./resource-class-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceClassInfoComponent implements OnChanges {
  @Input({ required: true }) resourceClass!: ResourceClassDefinitionWithAllLanguages;

  project$ = this._store.select(ProjectsSelectors.currentProject);

  classPropertiesToDisplay$!: Observable<ClassPropToDisplay[]>;

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  classHovered = false;
  menuOpen = false;

  expanded = true;

  classCanBeDeleted = false;

  get classLabel() {
    const lang = this._localizationService.getCurrentLanguage();
    const preferedLangLabel = this.resourceClass.labels.find(l => l.language === lang);
    return preferedLangLabel?.value || this.resourceClass.label || '';
  }

  get defaultClassLabel() {
    return this.resourceClass.subClassOf.map(superIri => DefaultResourceClasses.getLabel(superIri)).join(', ');
  }

  trackByPropToDisplayFn = (index: number, item: ClassPropToDisplay) => `${index}-${item.iHasProperty!.propertyIndex}`;

  constructor(
    private _dialog: MatDialog,
    private _localizationService: LocalizationService,
    private _dialogService: DialogService,
    private _oes: OntologyEditService,
    private _store: Store
  ) {}

  ngOnChanges() {
    this.classPropertiesToDisplay$ = this._oes.currentOntologyProperties$.pipe(
      map((properties: PropertyInfoObject[]) => {
        const propertyIdsOfClass = this.resourceClass.propertiesList.map(p => p.propertyIndex);

        return properties
          .filter(prop => propertyIdsOfClass.includes(prop.propDef!.id))
          .map(
            prop =>
              ({
                ...prop,
                iHasProperty: this.resourceClass.propertiesList.find(p => p.propertyIndex === prop.propDef!.id),
              }) as ClassPropToDisplay
          )
          .sort((a, b) => (a.iHasProperty?.guiOrder ?? 0) - (b.iHasProperty?.guiOrder ?? 0));
      })
    );
  }

  canBeDeleted() {
    this._oes
      .canDeleteResourceClass$(this.resourceClass.id)
      .pipe(take(1))
      .subscribe(response => {
        if (response instanceof ApiResponseError) {
          return;
        }
        this.classCanBeDeleted = response.canDo;
      });
  }

  editResourceClassInfo() {
    this._dialog.open<EditResourceClassDialogComponent, UpdateResourceClassData>(
      EditResourceClassDialogComponent,
      DspDialogConfig.dialogDrawerConfig(this.resourceClass as UpdateResourceClassData)
    );
  }

  deleteResourceClass() {
    this._dialogService
      .afterConfirmation('Do you want to delete this resource class ?')
      .pipe(switchMap(_del => this._oes.deleteResourceClass$(this.resourceClass.id)))
      .subscribe();
  }

  onPropertyDropped(event: CdkDragDrop<string[]>, properties: ClassPropToDisplay[]) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    moveItemInArray(properties, event.previousIndex, event.currentIndex);

    const iHasProperties = properties.map(prop => prop.iHasProperty!);

    iHasProperties.forEach((prop, index) => {
      prop.guiOrder = index + 1;
    });

    this._oes.updateGuiOrderOfClassProperties(this.resourceClass.id, iHasProperties);
  }

  openInDatabrowser() {
    const projectUuid = this._store.selectSnapshot(ProjectsSelectors.currentProjectsUuid);
    const ontologyName = OntologyService.getOntologyName(this._oes.ontologyId || '');
    const dataBrowserRoute = `/${RouteConstants.project}/${projectUuid}/${RouteConstants.ontology}/${ontologyName}/${this.resourceClass.id.split('#')[1]}`;
    window.open(dataBrowserRoute, '_blank');
  }
}
