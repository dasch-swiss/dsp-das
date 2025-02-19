import { AfterContentInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CanDoResponse,
  Cardinality,
  ClassDefinition,
  Constants,
  IHasProperty,
  ResourcePropertyDefinitionWithAllLanguages,
  UpdateResourceClassCardinality,
} from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ListsSelectors, OntologiesSelectors, PropToDisplay, UserSelectors } from '@dasch-swiss/vre/core/state';
import { DefaultProperty, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { OntologyEditService } from '../../services/ontology-edit.service';

@Component({
  selector: 'app-resource-class-property-info',
  templateUrl: './resource-class-property-info.component.html',
  styleUrls: ['./resource-class-property-info.component.scss'],
})
export class ResourceClassPropertyInfoComponent implements OnChanges, AfterContentInit, OnDestroy {
  @Input() propDef: ResourcePropertyDefinitionWithAllLanguages;

  @Input() propCard: IHasProperty;

  @Input() props: PropToDisplay[];

  @Input() resourceClass: ClassDefinition;

  @Select(UserSelectors.isMemberOfSystemAdminGroup) isAdmin$!: Observable<boolean>;

  projectUuid?: string;

  isDestroyed = new Subject<void>();

  propType: DefaultProperty;

  propAttribute: string;
  propAttributeComment: string;

  propCanBeRemovedFromClass: boolean;

  projectUuid$: Observable<string> = combineLatest([
    this._route.params,
    this._route.parent?.params,
    this._route.parent?.parent ? this._route.parent.parent.params : of({}),
  ]).pipe(
    map(([params, parentParams, parentParentParams]) => {
      return params[RouteConstants.uuidParameter]
        ? params[RouteConstants.uuidParameter]
        : parentParams[RouteConstants.uuidParameter]
          ? parentParams[RouteConstants.uuidParameter]
          : parentParentParams[RouteConstants.uuidParameter];
    })
  );

  constructor(
    private _ontoService: OntologyService,
    private _oes: OntologyEditService,
    private _route: ActivatedRoute,
    private _store: Store,
    private _cd: ChangeDetectorRef
  ) {
    this.projectUuid$.pipe().subscribe((projectUuid: string) => {
      this.projectUuid = projectUuid;
    });
  }

  ngOnChanges(): void {
    const currentProjectOntologies = this._store.selectSnapshot(OntologiesSelectors.currentProjectOntologies);

    // get info about subproperties, if they are not a subproperty of knora base ontology
    // in this case add it to the list of subproperty iris
    const superProp = this._ontoService.getSuperProperty(this.propDef, currentProjectOntologies);
    if (superProp) {
      if (this.propDef.subPropertyOf.indexOf(superProp) === -1) {
        this.propDef.subPropertyOf.push(superProp);
      }
    }

    // get the default property type for this property
    this._ontoService.getDefaultPropType(this.propDef).subscribe((prop: DefaultProperty) => {
      this.propType = prop;
    });
  }

  ngAfterContentInit() {
    // get current ontology to get linked res class information
    const ontology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
    const currentProjectOntologies = this._store.selectSnapshot(OntologiesSelectors.currentProjectOntologies);
    if (ontology && currentProjectOntologies && this.propDef.isLinkProperty) {
      // this property is a link property to another resource class
      // get the base ontology of object type
      const baseOnto = this.propDef.objectType.split('#')[0];
      if (baseOnto !== ontology.id) {
        // get class info from another ontology
        const onto = currentProjectOntologies.find(i => i.id === baseOnto);
        if (!onto) {
          if (this.propDef.objectType === Constants.Region) {
            this.propAttribute = 'Region';
          } // else no ontology found
        } else {
          this.propAttribute = onto.classes[this.propDef.objectType].label;
          this.propAttributeComment = onto.classes[this.propDef.objectType].comment;
        }
      } else {
        this.propAttribute = ontology.classes[this.propDef.objectType].label;
        this.propAttributeComment = ontology.classes[this.propDef.objectType].comment;
      }
    }

    // get current ontology lists to get linked list information
    this._store
      .select(ListsSelectors.listsInProject)
      .pipe(takeUntil(this.isDestroyed))
      .subscribe(currentOntologyLists => {
        if (currentOntologyLists && this.propDef.objectType === Constants.ListValue) {
          // this property is a list property
          const re = /\<([^)]+)\>/;
          const listIri = this.propDef.guiAttributes[0].match(re)[1];
          const listUrl = `/project/${this.projectUuid}/list/${listIri.split('/').pop()}`;
          const list = currentOntologyLists.find(i => i.id === listIri);
          if (list) {
            this.propAttribute = `<a href="${listUrl}">${list.labels[0].value}</a>`;
            this.propAttributeComment = list.comments.length ? list.comments[0].value : null;
          }
        }
      });
  }

  /**
   * determines whether a property can be removed from a class or not
   */
  canBeRemovedFromClass(): void {
    this._oes
      .propertyCanBeRemovedFromClass(this.propCard, this.resourceClass.id)
      .subscribe((canDoRes: CanDoResponse) => {
        this.propCanBeRemovedFromClass = canDoRes.canDo;
        this._cd.markForCheck();
      });
  }

  removePropertyFromClass(propDef: ResourcePropertyDefinitionWithAllLanguages): void {
    this._oes.removePropertyFromClass(propDef, this.resourceClass, this.props);
  }

  submitCardinalitiesChange(newValue: Cardinality) {
    const updateResourceClassCard = new UpdateResourceClassCardinality();
    updateResourceClassCard.id = this.resourceClass.id!; // TODO this.resClassIri;
    // find the prop in the this.props array and replace with this.propCard
    this.props.forEach((prop, index) => {
      if (prop.propertyIndex === this.propCard.propertyIndex) {
        this.props[index] = this.propCard;
      }
    });

    updateResourceClassCard.cardinalities = this.props;
    // get the property for replacing the cardinality
    const idx = updateResourceClassCard.cardinalities.findIndex(c => c.propertyIndex === this.propDef.id);
    updateResourceClassCard.cardinalities[idx].cardinality = newValue;
    this._oes.updateCardinalityOfResourceClass(updateResourceClassCard);
  }

  ngOnDestroy() {
    this.isDestroyed.next();
    this.isDestroyed.complete();
  }
}
