import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Constants, ReadOntology, ReadProject, ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ListsSelectors, OntologiesSelectors, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { DefaultProperty, OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { EditPropertyFormDialogComponent } from '../../forms/property-form/edit-property-form-dialog.component';
import { PropertyEditData } from '../../forms/property-form/property-form.type';
import { OntologyEditService } from '../../services/ontology-edit.service';

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
    private _dialog: MatDialog,
    private _ontoService: OntologyService,
    private _oes: OntologyEditService,
    private _dialogService: DialogService,
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

  openEditProperty(propDef: ResourcePropertyDefinitionWithAllLanguages, propType: DefaultProperty) {
    const propertyData: PropertyEditData = {
      id: propDef.id,
      propType,
      name: propDef.id?.split('#').pop() || '',
      label: propDef.labels,
      comment: propDef.comments,
      guiElement: propDef.guiElement || propType.guiElement,
      guiAttribute: propDef.guiAttributes[0],
      objectType: propDef.objectType,
    };
    this._dialog.open<EditPropertyFormDialogComponent, PropertyEditData>(
      EditPropertyFormDialogComponent,
      DspDialogConfig.dialogDrawerConfig(propertyData)
    );
  }

  openDeleteProperty(id: string) {
    this._dialogService
      .afterConfirmation('Do you want to delete this resource class ?')
      .pipe(switchMap(_del => this._oes.deleteProperty$(id)))
      .subscribe();
  }

  trackByFn = (index: number, item: ShortInfo) => item.id;

  mouseEnter() {
    if (this._oes.isTransacting) {
      return;
    }
    this.showActionBubble = true;
    this.canBeDeletedTrigger$.next();
  }

  mouseLeave() {
    this.showActionBubble = false;
  }
}
