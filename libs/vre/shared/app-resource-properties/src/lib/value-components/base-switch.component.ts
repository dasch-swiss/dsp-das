import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SwitchComponent } from '../switch-components/switch-component.interface';

@Component({
  selector: 'app-base-switch',
  template: ` <ng-container *ngIf="displayMode; else editMode">{{ control.value }}</ng-container>
    <ng-template #editMode>
      <ng-content></ng-content>
    </ng-template>`,
})
export class BaseSwitchComponent implements SwitchComponent {
  @Input() control!: FormControl<number>;
  @Input() displayMode = true;
}
