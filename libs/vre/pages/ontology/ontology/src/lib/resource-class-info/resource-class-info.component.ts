import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import {
  ApiResponseError,
  Constants,
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
  PropToDisplay,
  ReplacePropertyAction,
  UserSelectors,
} from '@dasch-swiss/vre/core/state';
import {
  DefaultClass,
  DefaultResourceClasses,
  LocalizationService,
  ProjectService,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource-class-info',
  templateUrl: './resource-class-info.component.html',
  styleUrls: ['./resource-class-info.component.scss'],
})
export class ResourceClassInfoComponent implements OnInit {
  @Input({ required: true }) resourceClass!: ResourceClassDefinitionWithAllLanguages;

  @Select(ProjectsSelectors.currentProject) project$!: Observable<ReadProject>;
  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isAdmin$!: Observable<boolean>;

  currentProjectOntologyProperties$ = this._store.select(OntologiesSelectors.currentProjectOntologyProperties);

  // set to false if it is a subclass of a default class inheriting the order
  expanded = true;

  canChangeGuiOrder = false;

  classCanBeDeleted = false;

  classLabel = '';

  subClassOfLabel = '';

  readonly defaultClasses: DefaultClass[] = DefaultResourceClasses.data;

  currentOntologyPropertiesToDisplay$: Observable<PropToDisplay[]> = this.currentProjectOntologyProperties$.pipe(
    map(ontoProperties => this.getPropsToDisplay([...this.resourceClass.propertiesList], [...ontoProperties]))
  );

  trackByPropToDisplayFn = (index: number, item: PropToDisplay) => `${index}-${item.propertyIndex}`;

  constructor(
    private _localizationService: LocalizationService,
    private _notification: NotificationService,
    private _oes: OntologyEditService,
    private _store: Store,
    private _actions$: Actions
  ) {}

  ngOnInit(): void {
    this.translateSubClassOfIri(this.resourceClass.subClassOf);
    this.getOntologiesLabelsInPreferredLanguage();
  }

  private getPropsToDisplay(classProps: PropToDisplay[], ontoProperties: OntologyProperties[]): PropToDisplay[] {
    const propsToDisplay: PropToDisplay[] = [];
    let remainingProperties: PropertyDefinition[] = [];

    classProps.forEach((hasProp: PropToDisplay) => {
      const ontoIri = hasProp.propertyIndex.split(Constants.HashDelimiter)[0];
      // ignore http://api.knora.org/ontology/knora-api/v2 and ignore  http://www.w3.org/2000/01/rdf-schema
      if (ontoIri !== Constants.KnoraApiV2 && ontoIri !== Constants.Rdfs) {
        // get property definition from list of project ontologies
        const index = ontoProperties.findIndex((item: OntologyProperties) => item.ontology === ontoIri);
        remainingProperties = [...(ontoProperties[index]?.properties || [])];
        hasProp.propDef = remainingProperties.find(
          (obj: ResourcePropertyDefinitionWithAllLanguages) =>
            obj.id === hasProp.propertyIndex &&
            ((obj.subjectType && !obj.subjectType.includes('Standoff') && obj.objectType !== Constants.LinkValue) ||
              !obj.isLinkValueProperty)
        );

        // propDef was found, add hasProp to the properties list which has to be displayed in this resource class
        if (hasProp.propDef) {
          if (propsToDisplay.indexOf(hasProp) === -1) {
            propsToDisplay.push(hasProp);
          }

          // and remove from list of existing properties to avoid double cardinality entries
          // because the prop displayed in the class cannot be added a second time,
          // so we have to hide it from the list of "Add existing property"
          const delProp = remainingProperties.indexOf(hasProp.propDef, 0);
          if (delProp > -1) {
            remainingProperties.splice(delProp, 1);
          }
        }
      }
    });
    return propsToDisplay;
  }

  getOntologiesLabelsInPreferredLanguage(): void {
    const preferredLanguage = this._localizationService.getCurrentLanguage();
    const preferedLabelLiteral = this.resourceClass.labels.find(l => l.language === preferredLanguage);
    this.classLabel = preferedLabelLiteral ? preferedLabelLiteral.value : this.resourceClass.label || '';
  }

  /**
   * translates iris from "subclass of" array
   * - display label from default resource classes (as part of DSP System Project)
   * - in case the class is a subclass of another class in the same ontology: display this class label
   * - in none of those cases display the name from the class IRI
   *
   * @param classIris
   */
  translateSubClassOfIri(classIris: string[]) {
    const ontology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
    if (!ontology) {
      return;
    }

    // reset the label
    this.subClassOfLabel = '';

    classIris.forEach((iri, index) => {
      // get ontology iri from class iri
      const splittedIri = iri.split('#');
      const ontologyIri = splittedIri[0];
      const className = splittedIri[1];

      this.subClassOfLabel += index > 0 ? ', ' : '';

      // find default class for the current class iri
      const defaultClass = this.defaultClasses.find(i => i.iri === iri);
      if (defaultClass) {
        this.subClassOfLabel += defaultClass.label;
        this.canChangeGuiOrder = true;
      } else if (ontology.id === ontologyIri) {
        // the class is not defined in the default classes
        // but defined in the current ontology
        // get class label from there
        this.subClassOfLabel += ontology.classes[iri].label;
        // in this case, the user can't update the cardinality incl. the gui order in this class
        // we have to disable this update cardinality functionality
        this.canChangeGuiOrder = false;
      } else {
        // the ontology iri of the upper class couldn't be found
        // display the class name
        if (className) {
          this.subClassOfLabel += className;
        } else {
          // iri is not kind of [ontologyIri]#[className]
          this.subClassOfLabel += iri
            .split('/')
            .filter(e => e)
            .slice(-1);
        }
        // in this case, the user can't update the currentCardinality incl. the gui order in this class
        // we have to disable this update currentCardinality functionality
        this.canChangeGuiOrder = false;
      }
    });
  }

  canBeDeleted() {
    // check if the class can be deleted
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
      this._store.dispatch(new ReplacePropertyAction(this.resourceClass, currentOntologyPropertiesToDisplay));
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

  /**
   * opens resource instances in new tab using gravsearch
   * @param iri
   */
  openResourceInstances(iri: string) {
    // open resource instances in new tab:
    // it's important not to indent the gravsearch.
    const gravsearch = `
PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>
CONSTRUCT {

?mainRes knora-api:isMainResource true .


} WHERE {

?mainRes a knora-api:Resource .

?mainRes a <${iri}> .

}

OFFSET 0`;

    const doSearchRoute = `/${RouteConstants.search}/${RouteConstants.gravSearch}/${encodeURIComponent(gravsearch)}`;
    window.open(doSearchRoute, '_blank');
  }
}
