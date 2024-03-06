import { Component, Input } from '@angular/core';
import { FormArray } from '@angular/forms';
import { Constants, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-switch-properties-3',
  template: ` <ng-container [ngSwitch]="property.objectType">
    <app-int-value-3 *ngSwitchCase="constants.IntValue" [formArray]="formArray"></app-int-value-3>
  </ng-container>`,
})
export class SwitchProperties3Component {
  @Input() property: ResourcePropertyDefinition;
  @Input() formArray: FormArray;
  constants = Constants;
}
