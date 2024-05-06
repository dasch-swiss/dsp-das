import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateTime } from '@dsp-app/src/app/workspace/resource/values/time-value/time-input/time-input.component';
import { dateTimeTimestamp } from '../date-time-timestamp';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-time-switch',
  template: ` <ng-container *ngIf="displayMode; else editMode">
      <div>Date: {{ test | date }}</div>
      <div>Time: {{ test | date: 'HH:mm' }}</div>
    </ng-container>
    <ng-template #editMode>
      <app-time-input-2 [control]="control"></app-time-input-2>
    </ng-template>`,
})
export class TimeSwitchComponent implements IsSwitchComponent {
  @Input() control!: FormControl<DateTime>;
  @Input() displayMode = true;

  get test() {
    return dateTimeTimestamp(this.control.value.date, this.control.value.time);
  }
}
