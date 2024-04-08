import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SwitchComponent } from '../switch-components/switch-component.interface';

@Component({
  selector: 'app-int-switch',
  template: ` <ng-container *ngIf="displayMode; else editMode">{{ control.value }}</ng-container>
    <ng-template #editMode>
      <app-common-input type="number" [control]="control"></app-common-input>
    </ng-template>`,
})
export class IntSwitchComponent implements SwitchComponent {
  @Input() control!: FormControl<number>;
  @Input() displayMode = true;
}
