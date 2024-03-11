import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-time-value-2',
  template: `
    <app-jdn-datepicker [activeCalendar]="'Gregorian'">
      <mat-form-field>
        <input
          matInput
          [matDatepicker]="picker"
          [formControl]="dateForm"
          (dateChange)="test($event)"
          aria-label="Date"
          placeholder="date"
          readonly />
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </app-jdn-datepicker>
    <mat-form-field>
      <input
        matInput
        [formControl]="dateForm"
        type="time"
        aria-label="Time"
        (input)="test($event)"
        placeholder="time" />
    </mat-form-field>
  `,
})
export class TimeValue2Component {
  @Input() control: FormControl<any>;

  get dateForm() {
    return this.control;
  }

  test(event) {
    console.log(event, 's');
  }
}
