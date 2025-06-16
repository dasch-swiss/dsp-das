import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Constants, ReadOntology, ReadProject, ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/3rd-party-services/api';
import { ListsSelectors, OntologiesSelectors, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { DefaultProperty, OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { OntologyEditService } from '../services/ontology-edit.service';

export interface ShortInfo {
  id: string;
  label: string;
  comment: string;
  restrictedToClass?: string;
}

@Component({
  selector: 'app-property-info',
  templateUrl: './property-info.component.html',
  styleUrls: ['./property-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // the fade-in/fade-out animation.
    // https://www.kdechant.com/blog/angular-animations-fade-in-and-fade-out
    trigger('simpleFadeAnimation', [
      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({ opacity: 1 })),

      // fade in when created.
      transition(':enter', [
        // the styles start from this point when the element appears
        style({ opacity: 0 }),
        // and animate toward the "in" state above
        animate(150),
      ]),

      // fade out when destroyed.
      transition(
        ':leave',
        // fading out uses a different syntax, with the "style" being passed into animate()
        animate(150, style({ opacity: 0 }))
      ),
    ]),
  ],
})
export class PropertyInfoComponent implements OnInit {
  @Input({ required: true }) propDef!: ResourcePropertyDefinitionWithAllLanguages;

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  project!: ReadProject | undefined;

  propAttribute: string | undefined;
  propAttributeComment: string | undefined;

  usedByClasses: ShortInfo[] = [];

  showActionBubble = false;

  readonly canBeDeletedTrigger$ = new BehaviorSubject<void>(undefined);

  readonly canBeDeleted$ = this.canBeDeletedTrigger$.asObservable().pipe(
    switchMap(() => this._oes.canDeleteResourceProperty$(this.propDef.id)),
    map(res => res.canDo),
    startWith(false)
  );

  isLockHovered = false;

  get propType(): DefaultProperty {
    return this._ontoService.getDefaultPropertyType(this.propDef);
  }

  get propertiesBaseOntology(): string | undefined {
    return this.propDef.objectType?.split('#')[0];
  }

  constructor(
    private _ontoService: OntologyService,
    private _oes: OntologyEditService,
    private _projectService: ProjectService,
    private _store: Store
  ) {
    this.project = this._store.selectSnapshot(ProjectsSelectors.currentProject);
  }

  ngOnInit() {
    this._store.select(OntologiesSelectors.currentProjectOntologies).subscribe(ontologies => {
      if (ontologies.length) {
        this._collectUsedByClasses(ontologies);

        if (this.propDef.isLinkProperty || this.propDef.objectType === Constants.ListValue) {
          this._setAdditionalAttributes(ontologies);
        }
      }
    });
  }

  private _collectUsedByClasses(projectsOntologies: ReadOntology[]) {
    projectsOntologies.forEach(onto => {
      getAllEntityDefinitionsAsArray(onto.classes).forEach(resClass => {
        const usedByClass = resClass.propertiesList.some(prop => prop.propertyIndex === this.propDef.id);
        const isAlreadyAdded = this.usedByClasses.some(c => c.id === resClass.id);

        if (usedByClass && !isAlreadyAdded) {
          this.usedByClasses.push({
            id: resClass.id,
            label: resClass.label!,
            comment: `${onto.label}: ${resClass.comment}`,
            restrictedToClass: this.propDef.isLinkProperty ? this.propDef.subjectType : undefined,
          });
        }
      });
    });
    this.usedByClasses.sort((a, b) => (a.label > b.label ? 1 : -1));
  }

  private _setAdditionalAttributes(projectsOntologies: ReadOntology[]) {
    if (this.propDef.objectType && this.propDef.objectType === Constants.Region) {
      this.propAttribute = 'Region';
      return;
    }

    if (this.propDef.isLinkProperty && this.propDef.objectType && this.propDef.objectType !== Constants.Region) {
      const currentOntology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
      const onto =
        this.propertiesBaseOntology === currentOntology?.id
          ? currentOntology
          : projectsOntologies.find(i => i.id === this.propertiesBaseOntology);

      this.propAttribute = onto?.classes[this.propDef.objectType]?.label ?? '';
      this.propAttributeComment = onto?.classes[this.propDef.objectType]?.comment ?? '';
      return;
    }

    if (this.propDef.objectType === Constants.ListValue) {
      const currentProjectsLists = this._store.selectSnapshot(ListsSelectors.listsInProject);
      const projectUuid = this._projectService.uuidToIri(this.project.id);

      const listIri = this.propDef.guiAttributes[0].split('<')[1].replace(/>/g, '');
      const listUrl = `/project/${projectUuid}/lists/${encodeURIComponent(listIri)}`;
      const list = currentProjectsLists.find(i => i.id === listIri);
      this.propAttribute = `<a href="${listUrl}">${list?.labels[0].value}</a>`;
      this.propAttributeComment = list?.comments.length ? list.comments[0].value : '';
    }
  }

  trackByFn = (index: number, item: ShortInfo) => item.id;

  editResourceProperty(propDef: ResourcePropertyDefinitionWithAllLanguages, propType: DefaultProperty) {
    this._oes.openEditProperty(propDef, propType);
  }

  deleteResourceProperty(iri: string) {
    this._oes.deleteProperty(iri);
  }

  mouseEnter() {
    this.showActionBubble = true;
    this.canBeDeletedTrigger$.next();
  }

  mouseLeave() {
    this.showActionBubble = false;
  }
}
