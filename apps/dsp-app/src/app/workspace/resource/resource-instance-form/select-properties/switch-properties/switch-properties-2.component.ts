import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Constants, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-switch-properties-2',
  template: `
    <span [ngSwitch]="property.objectType">
      <app-int-value-2 *ngSwitchCase="constants.IntValue" [control]="control"></app-int-value-2>
      <app-boolean-value-2 *ngSwitchCase="constants.BooleanValue" [control]="control"></app-boolean-value-2>

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
