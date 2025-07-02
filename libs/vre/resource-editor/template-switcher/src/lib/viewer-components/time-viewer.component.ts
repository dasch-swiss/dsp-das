import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateTime, dateTimeTimestamp } from '@dasch-swiss/vre/resource-editor/resource-properties';

@Component({
  selector: 'app-time-viewer',
  template: `
    <div data-cy="time-switch-date">Date: {{ dateTime | date }}</div>
    <div data-cy="time-switch-time">Time: {{ dateTime | date: 'HH:mm' }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeViewerComponent {
  @Input({ required: true }) control!: FormControl<DateTime>;

  get dateTime() {
    return dateTimeTimestamp(this.control.value.date, this.control.value.time);
  }
}
