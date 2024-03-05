import { Component, Input } from '@angular/core';
import { ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';

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
}
