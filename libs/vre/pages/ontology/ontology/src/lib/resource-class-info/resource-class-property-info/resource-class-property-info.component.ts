import { AfterContentInit, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import {
  Cardinality,
  ClassDefinition,
  Constants,
  IHasProperty,
  ResourcePropertyDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import {
  ListsSelectors,
  OntologiesSelectors,
  ProjectsSelectors,
  PropToDisplay,
  UserSelectors,
} from '@dasch-swiss/vre/core/state';
import { DefaultProperty, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { OntologyEditService } from '../../services/ontology-edit.service';

@Component({
  selector: 'app-resource-class-property-info',
  templateUrl: './resource-class-property-info.component.html',
  styleUrls: ['./resource-class-property-info.component.scss'],
})
export class ResourceClassPropertyInfoComponent implements OnChanges, AfterContentInit {
  @Input({ required: true }) propDef!: ResourcePropertyDefinitionWithAllLanguages;

  @Input() propCard: IHasProperty;

  @Input() props: PropToDisplay[]; // Todo: remove this, input the single prop and get propsOfClass from the thore or so

  @Input() resourceClass: ClassDefinition;

  @Select(UserSelectors.isMemberOfSystemAdminGroup) isAdmin$!: Observable<boolean>;

  propAttribute?: string;
  propAttributeComment?: string;

  propCanBeRemovedFromClass: boolean | null = null;

  get propType(): DefaultProperty {
    return this._ontoService.getDefaultPropertyType(this.propDef);
  }

  get listUrl() {
    const re = /\<([^)]+)\>/;
    const match = this.propDef.guiAttributes[0]?.match(re);
    const listIri = match?.[1]?.length ? match[1] : '';
    const projectUuid = this._store.selectSnapshot(ProjectsSelectors.currentProjectsUuid);
    return listIri && projectUuid ? `/project/${projectUuid}/list/${listIri.split('/').pop()}` : null;
  }

  constructor(
    private _ontoService: OntologyService,
    private _oes: OntologyEditService,
    private _store: Store,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnChanges(): void {
    this._ontoService.getDefaultProperty(this.propDef);
  }

  ngAfterContentInit() {
    if (!this.propDef.isLinkProperty) {
      this._setAttributesForLinkProperty();
    }

    if (this.propDef.objectType === Constants.ListValue) {
      this._setAttributesForListProperty();
    }
  }

  private _setAttributesForListProperty() {
    const currentOntologyLists = this._store.selectSnapshot(ListsSelectors.listsInProject);
    const list = currentOntologyLists.find(i => i.id === this.listUrl);
    if (list) {
      this.propAttribute = `<a href="${this.listUrl}">${list.labels[0].value}</a>`;
      this.propAttributeComment = list.comments.length ? list.comments[0].value : undefined;
    }
  }

  private _setAttributesForLinkProperty() {
    if (this.propDef.objectType === Constants.Region) {
      this.propAttribute = 'Region';
      return;
    }

    const propertiesBaseOntologyId = this.propDef.objectType?.split('#')[0];
    const currentProjectOntologies = this._store.selectSnapshot(OntologiesSelectors.currentProjectOntologies);
    const baseOntology = currentProjectOntologies.find(i => i.id === propertiesBaseOntologyId);
    this.propAttribute = baseOntology?.classes[this.propDef.objectType!].label;
    this.propAttributeComment = baseOntology?.classes[this.propDef.objectType!].comment;
  }

  canBeRemovedFromClass(): void {
    this._oes.propertyCanBeRemovedFromClass(this.propCard, this.resourceClass.id).subscribe(canDoRes => {
      this.propCanBeRemovedFromClass = canDoRes.canDo;
      this._cd.markForCheck();
    });
  }

  removePropertyFromClass(): void {
    this._oes.removePropertyFromClass(this.propCard, this.resourceClass.id);
  }

  openEditProperty() {
    this._oes.openEditProperty(this.propDef, this.propType);
  }

  updateCardinality(newValue: Cardinality) {
    const propertyIdx = this.props.findIndex(p => p.propertyIndex === this.propCard.propertyIndex);
    if (propertyIdx !== -1) {
      this.props[propertyIdx] = this.propCard;
      this.props[propertyIdx].cardinality = newValue;
      this._oes.updateCardinalitiesOfResourceClass(this.resourceClass.id, this.props);
    }
  }
}
