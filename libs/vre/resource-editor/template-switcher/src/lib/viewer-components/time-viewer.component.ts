import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ReadTimeValue } from '@dasch-swiss/dsp-js';
import {
  convertTimestampToDateTime,
  DateTime,
  dateTimeTimestamp,
} from '@dasch-swiss/vre/resource-editor/resource-properties';

@Component({
  selector: 'app-time-viewer',
  template: `
    <div data-cy="time-switch-date">Date: {{ dateTime | date }}</div>
    <div data-cy="time-switch-time">Time: {{ dateTime | date: 'HH:mm' }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeViewerComponent implements OnChanges {
  @Input({ required: true }) value!: ReadTimeValue;
  myDate!: DateTime;

  ngOnChanges() {
    this.myDate = convertTimestampToDateTime(this.value.time, new DatePipe('en-US'));
  }

  get dateTime() {
    return dateTimeTimestamp(this.myDate.date, this.myDate.time);
  }
}
