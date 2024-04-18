import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KnoraDate, KnoraPeriod } from '@dasch-swiss/dsp-js';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-date-switch',
  template: `
    <ng-container *ngIf="displayMode; else editMode">
      <ng-container *ngIf="isKnoraPeriod; else knoraDateTpl"
        >{{ start.day }}.{{ start.month }}.{{ start.year }}
        <span>- {{ end.day }}.{{ end.month }}.{{ end.year }}</span>
      </ng-container>
    </ng-container>

    <ng-template #knoraDateTpl>{{ knoraDate.day }}.{{ knoraDate.month }}.{{ knoraDate.year }}</ng-template>

    <ng-template #editMode>
      <app-date-value-handler [formControl]="control"></app-date-value-handler>
    </ng-template>
  `,
})
export class DateSwitchComponent implements IsSwitchComponent {
  get start() {
    return (this.control.value as KnoraPeriod).start;
  }

  get end() {
    return (this.control.value as KnoraPeriod).end;
  }

  get knoraDate() {
    return this.control.value as KnoraDate;
  }

  @Input() control!: FormControl<KnoraDate | KnoraPeriod>;
  @Input() displayMode = true;

  isKnoraPeriod!: boolean;

  ngOnInit() {
    this.isKnoraPeriod = this.control.value instanceof KnoraPeriod;
  }
}
