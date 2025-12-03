import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDateFormats,
  NativeDateAdapter,
} from '@angular/material/core';
import { DateTime } from '@dasch-swiss/vre/resource-editor/resource-properties';

/**
 * Custom date adapter that formats dates as DD.MM.YYYY
 */
class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: unknown): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${this._to2digit(day)}.${this._to2digit(month)}.${year}`;
  }

  override parse(value: unknown): Date | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      const parts = value.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);

        if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
          return new Date(year, month, day);
        }
      }
    }

    return super.parse(value);
  }

  private _to2digit(n: number): string {
    return `00${n}`.slice(-2);
  }
}

const NATIVE_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'input',
  },
  display: {
    dateInput: 'input',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-time-value',
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: NATIVE_DATE_FORMATS },
  ],
  template: `
    <div style="display: flex; gap: 8px">
      <mat-form-field>
        <input
          matInput
          [matDatepicker]="picker"
          [ngModel]="control.value?.date"
          (dateChange)="editDate($event)"
          (click)="picker.open()"
          [attr.aria-label]="'resourceEditor.templateSwitcher.timeValue.date' | translate"
          [placeholder]="'resourceEditor.templateSwitcher.timeValue.datePlaceholder' | translate"
          readonly />
        <mat-datepicker-toggle matSuffix [for]="picker" />
        <mat-datepicker #picker />
      </mat-form-field>

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

  editDate(event: { value: Date }) {
    if (!event.value) {
      return;
    }

    if (!this.control.value?.time) {
      this.control.patchValue(new DateTime(event.value, '00:00'));
      return;
    }
    const newValue = new DateTime(event.value, this.control.value.time);
    this.control.patchValue(newValue);
  }
}
