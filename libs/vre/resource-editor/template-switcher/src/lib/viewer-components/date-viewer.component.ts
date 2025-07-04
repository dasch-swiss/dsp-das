import { Component, Input, OnInit } from '@angular/core';
import { KnoraDate, KnoraPeriod, ReadDateValue } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-date-viewer',
  template: `
    <ng-container *ngIf="isKnoraPeriod; else knoraDateTpl">
      <ng-container *ngTemplateOutlet="calendarType; context: { date: start }"></ng-container>
      <span>{{ start | knoraDate: 'dd.MM.YYYY' : 'era' }}</span>
      -
      <span>{{ end | knoraDate: 'dd.MM.YYYY' : 'era' }}</span>
    </ng-container>

    <ng-template #knoraDateTpl>
      <ng-container *ngTemplateOutlet="calendarType; context: { date: knoraDate }"></ng-container>
      <span>{{ knoraDate | knoraDate: 'dd.MM.YYYY' : 'era' }}</span>
    </ng-template>

    <ng-template #calendarType let-date="date">
      <div class="mat-body-2" data-cy="date-switch" style="font-size: 12px">
        {{ date | knoraDate: 'dd.MM.YYYY' : 'calendarOnly' }}
      </div>
    </ng-template>
  `,
})
export class DateViewerComponent implements OnInit {
  @Input({ required: true }) value!: ReadDateValue;

  get start() {
    return (this.value.date as KnoraPeriod).start;
  }

  get end() {
    return (this.value.date as KnoraPeriod).end;
  }

  get knoraDate() {
    return this.value.date as KnoraDate;
  }

  isKnoraPeriod!: boolean;

  ngOnInit() {
    this.isKnoraPeriod = this.value.date instanceof KnoraPeriod;
  }
}
