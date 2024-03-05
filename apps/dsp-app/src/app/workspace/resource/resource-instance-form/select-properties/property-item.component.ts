import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CardinalityUtil, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-property-item',
  template: `<div class="property">
    <h3 class="mat-subtitle-2" [class.label-info]="prop.comment" [matTooltip]="prop.comment" matTooltipPosition="above">
      {{ prop.label }}
      <span *ngIf="propertyValuesKeyValuePair[prop.id + '-cardinality'][0] === 1">*</span>
    </h3>
    <div class="property-value large-field">
      <ng-container *ngFor="let val of propertyValuesKeyValuePair[prop.id]; let i = index">
        <ng-container *ngIf="val !== undefined">
          <app-switch-properties-2
            class="value"
            [property]="prop"
            [control]="myControl(prop.label + '_' + i)"></app-switch-properties-2>
          <!--
                          <app-switch-properties
                            #switchProp
                            [property]="prop"
                            [parentResource]="parentResource"
                            [parentForm]="parentForm"
                            [formName]="prop.label + '_' + i"
                            [isRequiredProp]="
                                                  propertyValuesKeyValuePair[
                                                      prop.id + '-cardinality'
                                                  ]
                                              "
                            [currentOntoIri]="currentOntoIri">
                          </app-switch-properties>-->
          <button
            mat-icon-button
            *ngIf="propertyValuesKeyValuePair[prop.id + '-filtered'].length !== 1"
            type="button"
            class="value-action delete"
            title="Delete this value"
            (click)="deleteValue(prop, i, $event)">
            <mat-icon>delete</mat-icon>
          </button>
        </ng-container>
      </ng-container>

      <!-- Add button -->
      <div *ngIf="addValueIsAllowed(prop)">
        <button
          mat-icon-button
          type="button"
          class="value-action create"
          title="Add a new value"
          (click)="addNewValueFormToProperty(prop, $event)">
          <mat-icon>add_box</mat-icon>
        </button>
      </div>
    </div>
  </div>`,
})
export class PropertyItemComponent {
  @Input() prop: ResourcePropertyDefinition;
  @Input() propertyValuesKeyValuePair: any;
  @Input() ontologyInfo;
  @Input() selectedResourceClass;
  @Input() parentForm;
  myControl(label: string) {
    return this.parentForm.controls[label] as FormControl<any>;
  }
  addNewValueFormToProperty(prop: ResourcePropertyDefinition, ev: Event) {
    ev.preventDefault();

    // get the length of the corresponding property values array
    const length = this.propertyValuesKeyValuePair[prop.id].length;

    // add a new element to the corresponding property values array.
    // conveniently, we can use the length of the array to add the next number in the sequence
    this.propertyValuesKeyValuePair[prop.id].push(length);

    // add a new element to the corresponding filtered property values array as well.
    // if this array contains more than one element, the delete button with be shown
    this.propertyValuesKeyValuePair[`${prop.id}-filtered`].push(length);
  }

  deleteValue(prop: ResourcePropertyDefinition, index: number, ev: Event) {
    ev.preventDefault();
    // don't actually remove the item from the property values array, just set it to undefined.
    // this is because if we actually modify the indexes of the array, the template will re-evaluate
    // and recreate components for any elements after the deleted index, effectively erasing entered data if any was entered
    this.propertyValuesKeyValuePair[prop.id][index] = undefined;

    // update the filtered version of the corresponding property values array.
    // used in the template to calculate if the delete button should be shown.
    // i.e. don't show the delete button if there is only one value
    this.propertyValuesKeyValuePair[`${prop.id}-filtered`] = this._filterValueArray(
      this.propertyValuesKeyValuePair[prop.id]
    );
  }

  /**
   * given a resource property, check if an add button should be displayed under the property values
   *
   * @param prop the resource property
   */
  addValueIsAllowed(prop: ResourcePropertyDefinition): boolean {
    return CardinalityUtil.createValueForPropertyAllowed(
      prop.id,
      this.propertyValuesKeyValuePair[prop.id].length,
      this.ontologyInfo.classes[this.selectedResourceClass.id]
    );
  }

  private _filterValueArray(arrayToFilter: number[]): number[] {
    arrayToFilter = arrayToFilter.filter(element => element !== undefined);

    return arrayToFilter;
  }
}
