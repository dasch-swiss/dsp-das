import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  CanDoResponse,
  Cardinality,
  ClassDefinition,
  Constants,
  IHasProperty,
  KnoraApiConnection,
  ResourcePropertyDefinitionWithAllLanguages,
  UpdateOntology,
  UpdateResourceClassCardinality,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ListsSelectors, LoadOntologyAction, OntologiesSelectors, PropToDisplay } from '@dasch-swiss/vre/core/state';
import { DefaultClass, DefaultProperty, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Actions, Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-resource-class-property-info',
  templateUrl: './resource-class-property-info.component.html',
  styleUrls: ['./resource-class-property-info.component.scss'],
})
export class ResourceClassPropertyInfoComponent implements OnChanges, AfterContentInit, OnDestroy {
  @Input() propDef: ResourcePropertyDefinitionWithAllLanguages;

  @Input() propCard: IHasProperty;

  @Input() props: PropToDisplay[];

  @Input() classIri?: string;

  @Input() projectUuid: string;

  @Input() lastModificationDate?: string;

  @Input() userCanEdit: boolean; // is user a project admin or sys admin?

  @Output() removePropertyFromClass: EventEmitter<DefaultClass> = new EventEmitter<DefaultClass>();

  @Input() resourceClass: ClassDefinition;

  isDestroyed = new Subject<void>();

  propType: DefaultProperty;

  propAttribute: string;
  propAttributeComment: string;

  propCanBeRemovedFromClass: boolean;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _ontoService: OntologyService,
    private _store: Store,
    private _cd: ChangeDetectorRef
  ) {}

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
    // check if the property can be removed from res class
    if (!this.lastModificationDate) {
      // guard
      return;
    }

    // property can only be removed from class if it's not inherited from another prop or class
    if (this.propCard.isInherited) {
      // other guard
      this.propCanBeRemovedFromClass = false;
      return;
    }
    const onto = new UpdateOntology<UpdateResourceClassCardinality>();

    onto.lastModificationDate = this.lastModificationDate;

    const ontology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
    onto.id = ontology.id;

    const delCard = new UpdateResourceClassCardinality();

    delCard.id = this.classIri;

    delCard.cardinalities = [];

    delCard.cardinalities = [this.propCard];
    onto.entity = delCard;

    this._dspApiConnection.v2.onto.canDeleteCardinalityFromResourceClass(onto).subscribe((canDoRes: CanDoResponse) => {
      this.propCanBeRemovedFromClass = canDoRes.canDo;
      this._cd.markForCheck();
    });
  }

  submitCardinalitiesChange(newValue: Cardinality) {
    const ontology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
    // get the ontology, the class and its properties
    const classUpdate = new UpdateOntology<UpdateResourceClassCardinality>();
    classUpdate.lastModificationDate = this.lastModificationDate;
    classUpdate.id = ontology.id;
    const changedClass = new UpdateResourceClassCardinality();
    changedClass.id = this.classIri; // TODO this.resClassIri;
    // find the prop in the this.props array and replace with this.propCard
    this.props.forEach((prop, index) => {
      if (prop.propertyIndex === this.propCard.propertyIndex) {
        this.props[index] = this.propCard;
      }
    });

    changedClass.cardinalities = this.props;
    // get the property for replacing the cardinality
    const idx = changedClass.cardinalities.findIndex(c => c.propertyIndex === this.propDef.id);
    changedClass.cardinalities[idx].cardinality = newValue;

    classUpdate.entity = changedClass;
    this._dspApiConnection.v2.onto
      .replaceCardinalityOfResourceClass(classUpdate)
      .pipe(
        tap(() => {
          this._store.dispatch(new LoadOntologyAction(ontology?.id || '', this.projectUuid, true));
        }),
        take(1)
      )
      .subscribe(response => {});
  }

  ngOnDestroy() {
    this.isDestroyed.next();
    this.isDestroyed.complete();
  }
}
