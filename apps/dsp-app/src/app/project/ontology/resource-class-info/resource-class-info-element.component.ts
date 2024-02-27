import { Component, Input } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { Cardinality, ClassDefinition, UpdateOntology, UpdateResourceClassCardinality } from '@dasch-swiss/dsp-js';
import { DefaultClass, DefaultProperty } from '@dasch-swiss/vre/shared/app-helper-services';
import {
  OntologiesSelectors,
  OntologyProperties,
  PropToDisplay,
  RemovePropertyAction,
} from '@dasch-swiss/vre/shared/app-state';
import { GuiCardinality } from '@dsp-app/src/app/project/ontology/resource-class-info/resource-class-property-info/resource-class-property-info.component';
import { ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resource-class-info-element',
  template: ` <div
    cdkDrag
    [cdkDragDisabled]="!ontology.lastModificationDate || !canChangeGuiOrder || !userCanEdit"
    *ngFor="let prop of currentOntologyPropertiesToDisplay; let i = index; trackBy: trackByPropToDisplayFn">
    <div class="drag-n-drop-placeholder" *cdkDragPlaceholder></div>
    <mat-list-item class="property" [disabled]="loadProperty">
      <span cdkDragHandle matListItemIcon class="list-icon gui-order">
        <span [class.hide-on-hover]="canChangeGuiOrder && (lastModificationDate$ | async) && userCanEdit">
          {{ i + 1 }})
        </span>
        <span
          *ngIf="canChangeGuiOrder && (lastModificationDate$ | async) && userCanEdit"
          class="display-on-hover drag-n-drop-handle">
          <mat-icon>drag_indicator</mat-icon>
        </span>
      </span>
      <!-- display only properties if they exist in list of properties;
                                     objectType is not a linkValue (otherwise we have the property twice) -->
      <span matListItemTitle>
        <app-resource-class-property-info
          class="property-info"
          [propDef]="currentOntologyPropertiesToDisplay[i]?.propDef"
          [propCard]="currentOntologyPropertiesToDisplay[i]"
          [projectUuid]="projectUuid"
          [resourceIri]="resourceClass.id"
          [lastModificationDate]="lastModificationDate$ | async"
          [userCanEdit]="userCanEdit"
          (removePropertyFromClass)="removeProperty($event, currentOntologyPropertiesToDisplay)"
          (changeCardinalities)="changeCardinalities($event, currentOntologyPropertiesToDisplay)">
        </app-resource-class-property-info>
      </span>
    </mat-list-item>
  </div>`,
})
export class ResourceClassInfoElementComponent {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Input() userCanEdit: boolean;
  @Input() resourceClass: ClassDefinition;
  @Input() projectUuid: string;

  @Select(OntologiesSelectors.currentProjectOntologyProperties)
  currentProjectOntologyProperties$: Observable<OntologyProperties[]>;
  currentOntologyPropertiesToDisplay$ = this._store.select(OntologiesSelectors.currentProjectOntologyProperties).pipe(
    takeUntil(this.ngUnsubscribe),
    map(ontoProperties => this.getPropsToDisplay([...this.resourceClass.propertiesList], [...ontoProperties]))
  );

  constructor(private _store: Store) {}

  /**
   * changeCardinalities: Open the dialogue in order to change the currentCardinality of an existing property and
   * class combination
   * @param cardRequest information about the property, its type and its new cardinalities to be set
   * */
  changeCardinalities(
    cardRequest: {
      prop: PropToDisplay;
      propType: DefaultProperty;
      targetCardinality: GuiCardinality;
    },
    currentOntologyPropertiesToDisplay: PropToDisplay[]
  ) {
    const dialogConfig: MatDialogConfig = {
      width: '640px',
      maxHeight: '80vh',
      position: {
        top: '112px',
      },
      data: {
        propInfo: {
          propDef: cardRequest.prop.propDef,
          propType: cardRequest.propType,
        },
        title: 'Update cardinality',
        subtitle: `Set the cardinality for property ${cardRequest.prop.propDef.label}`,
        mode: 'updateCardinality',
        parentIri: this.resourceClass.id,
        currentCardinality: cardRequest.prop.cardinality,
        targetCardinality: cardRequest.targetCardinality,
        classProperties: currentOntologyPropertiesToDisplay,
      },
    };
    this.openEditDialog(dialogConfig);
  }

  newChangeCardinalities(
    cardRequest: {
      prop: PropToDisplay;
      propType: DefaultProperty;
      targetCardinality: GuiCardinality;
    },
    currentOntologyPropertiesToDisplay: PropToDisplay[]
  ) {
    this._dialogService.afterConfirmation('Please note that this change may not be reversible.').subscribe(() => {
      // get the ontology, the class and its properties
      const classUpdate = new UpdateOntology<UpdateResourceClassCardinality>();
      classUpdate.lastModificationDate = this.ontology.lastModificationDate;
      classUpdate.id = this.ontology.id;
      const changedClass = new UpdateResourceClassCardinality();
      changedClass.id = this.resourceClass.id;
      changedClass.cardinalities = currentOntologyPropertiesToDisplay;

      // get the property for replacing the cardinality
      const idx = changedClass.cardinalities.findIndex(c => c.propertyIndex === cardRequest.prop.propDef.id);
      if (idx === -1) {
        return;
      }
      // set the new cardinality
      changedClass.cardinalities[idx].cardinality = Cardinality._1_n; // TODO CHANGE TO VALUE RECEIVED!!;

      classUpdate.entity = changedClass;
      this._dspApiConnection.v2.onto.replaceCardinalityOfResourceClass(classUpdate).subscribe(() => {});
    });
  }

  /**
   * removes property from resource class
   * @param property
   */
  removeProperty(property: DefaultClass, currentOntologyPropertiesToDisplay: PropToDisplay[]) {
    // TODO temporary solution to replace eventemitter with subject because emitter loses subscriber after following subscription is triggered
    this.updatePropertyAssignment.pipe(take(1)).subscribe(() => this.updatePropertyAssignment$.next());

    this._store.dispatch(new RemovePropertyAction(property, this.resourceClass, currentOntologyPropertiesToDisplay));
    this._actions$
      .pipe(ofActionSuccessful(RemovePropertyAction))
      .pipe(take(1))
      .subscribe(res => {
        // TODO should be the same as ontology lastModificationDate ? if yes remove commented line, otherwise add additional lastModificationDate property to the state
        // this.lastModificationDate = res.lastModificationDate;
        this.updatePropertyAssignment.emit(this.ontology.id);
      });
  }
}
