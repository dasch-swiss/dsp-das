import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KnoraPeriod } from '@dasch-swiss/dsp-js';
import { SwitchComponent } from './switch-component.interface';

@Component({
  selector: 'app-date-switch',
  template: `
    <ng-container *ngIf="displayMode; else editMode"
      >{{ start.day }}.{{ start.month }}.{{ start.year }}
      <span *ngIf="end as _end">- {{ _end.day }}.{{ _end.month }}.{{ _end.year }}</span>
    </ng-container>
    <ng-template #editMode>
      <app-date-value-handler [formControl]="control"></app-date-value-handler>
    </ng-template>
  `,
})
export class DateSwitchComponent implements SwitchComponent {
  get start() {
    return this.control.value.start;
  }

  get end() {
    return this.control.value.end;
  }

  @Input() control!: FormControl<KnoraPeriod>;
  @Input() displayMode = true;
}
