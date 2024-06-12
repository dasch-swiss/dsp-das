import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-time-input',
  template: `
    <mat-form-field style="width: 100%">
      <mat-label>{{ label }}</mat-label>
      <input matInput [formControl]="control" appTimeFormat placeholder="hh:mm:ss" />
      <mat-error *ngIf="control.invalid && control.touched"> Please enter a valid time in hh:mm:ss format. </mat-error>
    </mat-form-field>
  `,
})
export class TimeInputComponent {
  @Input({ required: true }) control!: FormControl;
  @Input({ required: true }) label!: string;
}
