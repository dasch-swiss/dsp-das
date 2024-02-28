import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormGroup } from '@angular/forms';
import { Constants, ReadResource, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { BaseValueDirective } from '../../../../../main/directive/base-value.directive';

@Component({
  selector: 'app-switch-properties-2',
  template: `
    <span [ngSwitch]="property.objectType">
      <app-int-value-2 *ngSwitchCase="constants.IntValue" [control]="control"></app-int-value-2>

      <span *ngSwitchDefault>
        <p>
          Cannot match any value component for
          <strong>{{ property.objectType }}</strong>
        </p>
      </span>
    </span>
  `,
})
export class SwitchProperties2Component {
  @Input() property: ResourcePropertyDefinition;
  @Input() control: FormControl<any>;

  constants = Constants;
}
