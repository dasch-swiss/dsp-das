import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  ApiResponseError,
  Constants,
  IHasProperty,
  PropertyDefinition,
  ReadProject,
  ResourceClassDefinitionWithAllLanguages,
  ResourcePropertyDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  OntologiesSelectors,
  OntologyProperties,
  ProjectsSelectors,
  PropToAdd,
  PropToDisplay,
  ReplacePropertyAction,
  UserSelectors,
} from '@dasch-swiss/vre/core/state';
import {
  DefaultClass,
  DefaultResourceClasses,
  LocalizationService,
  OntologyService,
  ProjectService,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource-class-info',
  templateUrl: './resource-class-info.component.html',
  styleUrls: ['./resource-class-info.component.scss'],
})
export class ResourceClassInfoComponent {
  @Input({ required: true }) resourceClass!: ResourceClassDefinitionWithAllLanguages;

  project$ = this._store.select(ProjectsSelectors.currentProject);

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  projectsProperties$: Observable<PropertyDefinition[]> = this._store
    .select(OntologiesSelectors.currentProjectOntologyProperties)
    .pipe(map(arr => arr.flatMap(o => o.properties)));

  classProperties$: Observable<PropertyDefinition[]> = this.projectsProperties$.pipe(
    map((properties: PropertyDefinition[]) => {
      const propertyIdsOfClass = this.resourceClass.propertiesList.map(p => p.propertyIndex);
      return properties.filter((property: PropertyDefinition) => propertyIdsOfClass.includes(property.id));
    })
  );

  classPropertiesToDisplay$: Observable<PropToDisplay[]> = this.classProperties$.pipe(
    map((properties: PropertyDefinition[]) => {
      return properties.map((property: PropertyDefinition) => {
        const propToDisplay: PropToDisplay = this.resourceClass.propertiesList.find(
          p => p.propertyIndex === property.id
        ) as PropToDisplay;
        propToDisplay.propDef = property;
        return propToDisplay;
      });
    })
  );

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

  trackByPropToDisplayFn = (index: number, item: PropToDisplay) => `${index}-${item.propertyIndex}`;

  constructor(
    private _actions$: Actions,
    private _localizationService: LocalizationService,
    private _notification: NotificationService,
    private _oes: OntologyEditService,
    private _store: Store
  ) {}

  canBeDeleted() {
    this._oes
      .canDeleteResourceClass(this.resourceClass.id)
      .pipe(take(1))
      .subscribe(response => {
        if (response instanceof ApiResponseError) {
          return;
        }
        this.classCanBeDeleted = response.canDo;
      });
  }

  /**
   * drag and drop property line
   */
  drop(event: CdkDragDrop<string[]>, currentOntologyPropertiesToDisplay: PropToDisplay[]) {
    // set sort order for child component
    moveItemInArray(
      currentOntologyPropertiesToDisplay, // TODO items should be updated in state if LoadProjectOntologiesAction is not executed after this
      event.previousIndex,
      event.currentIndex
    );

    if (event.previousIndex !== event.currentIndex) {
      // the dropped property item has a new index (= gui order)
      // send the new gui-order to the api by
      // preparing the UpdateOntology object first

      // this._store.dispatch(new ReplacePropertyAction(this.resourceClass, currentOntologyPropertiesToDisplay));
      this._actions$
        .pipe(ofActionSuccessful(ReplacePropertyAction))
        .pipe(take(1))
        .subscribe(() => {
          // successful request: update the view
          // display success message
          this._notification.openSnackBar(
            `You have successfully changed the order of properties in the resource class "${this.resourceClass.label}".`
          );
        });
    }
  }

  editResourceClassInfo() {
    this._oes.openEditResourceClass(this.resourceClass);
  }

  deleteResourceClass() {
    this._oes.deleteResourceClass(this.resourceClass.id);
  }

  openInDatabrowser() {
    const projectId = ProjectService.IriToUuid(this._store.selectSnapshot(ProjectsSelectors.currentProject)?.id || '');
    const ontologyName = OntologyService.getOntologyName(
      this._store.selectSnapshot(OntologiesSelectors.currentOntology)?.id || ''
    );
    const dataBrowserRoute = `/${RouteConstants.project}/${projectId}/${RouteConstants.ontology}/${ontologyName}/${this.resourceClass.id.split('#')[1]}`;
    window.open(dataBrowserRoute, '_blank');
  }
}
