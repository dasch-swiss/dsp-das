import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GregorianCalendarDate } from '@dasch-swiss/jdnconvertiblecalendar';
import { DateTime } from '@dasch-swiss/vre/resource-editor/resource-properties';

@Component({
  selector: 'app-time-value',
  template: `
    <div style="display: flex; gap: 8px">
      <app-jdn-datepicker [activeCalendar]="'Gregorian'">
        <mat-form-field>
          <input
            matInput
            [matDatepicker]="picker"
            [ngModel]="control.value?.date"
            (dateChange)="editDate($event)"
            [attr.aria-label]="'resourceEditor.templateSwitcher.timeValue.date' | translate"
            [placeholder]="'resourceEditor.templateSwitcher.timeValue.datePlaceholder' | translate"
            readonly />
          <mat-datepicker-toggle matSuffix [for]="picker" />
          <mat-datepicker #picker />
        </mat-form-field>
      </app-jdn-datepicker>

      <mat-form-field>
        <input
          matInput
          [disabled]="!control.value?.date"
          [ngModel]="control.value?.time"
          (ngModelChange)="editTime($event)"
          type="time"
          [attr.aria-label]="'resourceEditor.templateSwitcher.timeValue.time' | translate"
          data-cy="time-input" />
      </mat-form-field>
    </div>
    @if (control.touched && control.errors; as errors) {
      <mat-error>{{ errors | humanReadableError }}</mat-error>
    }
  `,
  standalone: false,
})
export class TimeValueComponent {
  @Input({ required: true }) control!: FormControl<DateTime>;

  editTime(newValue: string) {
    const newDate = new DateTime(this.control.value?.date, newValue);
    this.control.patchValue(newDate);
  }

  editDate(event: { value: GregorianCalendarDate }) {
    if (!this.control.value?.time) {
      this.control.patchValue(new DateTime(event.value, '00:00'));
      return;
    }
    const newValue = new DateTime(event.value, this.control.value.time);
    this.control.patchValue(newValue);
  }
}
