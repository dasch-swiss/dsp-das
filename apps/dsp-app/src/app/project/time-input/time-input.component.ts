import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { timeValidator } from './time-validator'; // Adjust the path accordingly

@Component({
  selector: 'app-time-input',
  template: `
    <form [formGroup]="timeForm">
      <mat-form-field appearance="fill">
        <mat-label>Time</mat-label>
        <input matInput formControlName="time" appTimeFormat placeholder="hh:mm:ss" />
        <mat-error *ngIf="time?.invalid && time?.touched"> Please enter a valid time in hh:mm:ss format. </mat-error>
      </mat-form-field>
    </form>
  `,
})
export class TimeInputComponent {
  timeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.timeForm = this.fb.group({
      time: ['', [Validators.required, timeValidator()]],
    });
  }

  get time() {
    return this.timeForm.get('time');
  }
}
