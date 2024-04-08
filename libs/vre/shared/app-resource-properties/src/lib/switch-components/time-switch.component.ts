import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SwitchComponent } from './switch-component.interface';

@Component({
  selector: 'app-time-switch',
  template: ` <ng-container *ngIf="displayMode; else editMode"
      >{{ control.value.date }} - {{ control.value.time }}
    </ng-container>
    <ng-template #editMode>
      <app-time-input [formControl]="control"></app-time-input>
    </ng-template>`,
})
export class TimeSwitchComponent implements SwitchComponent {
  @Input() control!: FormControl<{ date: any; time: any }>;
  @Input() displayMode = true;
}
