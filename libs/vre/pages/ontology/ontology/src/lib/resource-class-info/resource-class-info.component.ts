import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  ApiResponseError,
  IHasProperty,
  PropertyDefinition,
  ResourceClassDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { OntologiesSelectors, ProjectsSelectors, PropToDisplay } from '@dasch-swiss/vre/core/state';
import {
  DefaultResourceClasses,
  LocalizationService,
  OntologyService,
  ProjectService,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { map, take } from 'rxjs/operators';
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

  projectsProperties$ = this._store
    .select(OntologiesSelectors.currentProjectOntologyProperties)
    .pipe(map(arr => arr.flatMap(o => o.properties)));

  classProperties$ = this.projectsProperties$.pipe(
    map((properties: PropertyDefinition[]) => {
      const propertyIdsOfClass = this.resourceClass.propertiesList.map(p => p.propertyIndex);
      return properties.filter((property: PropertyDefinition) => propertyIdsOfClass.includes(property.id));
    })
  );

  classPropertiesToDisplay$ = this.classProperties$.pipe(
    map((properties: PropertyDefinition[]) => {
      return properties
        .map((property: PropertyDefinition) => {
          const propToDisplay: PropToDisplay = this.resourceClass.propertiesList.find(
            p => p.propertyIndex === property.id
          ) as PropToDisplay;
          propToDisplay.propDef = property;
          return propToDisplay;
        })
        .sort((a, b) => {
          return a.guiOrder - b.guiOrder;
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
    private _localizationService: LocalizationService,
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

  editResourceClassInfo() {
    this._oes.openEditResourceClass(this.resourceClass);
  }

  deleteResourceClass() {
    this._oes.deleteResourceClass(this.resourceClass.id);
  }

  onPropertyDropped(event: CdkDragDrop<string[]>, properties: PropToDisplay[]) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    moveItemInArray(properties, event.previousIndex, event.currentIndex);

    properties.forEach((prop, index) => {
      prop.guiOrder = index + 1;
    });

    this._oes.updateGuiOrderOfClassProperties(this.resourceClass.id, properties);
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
