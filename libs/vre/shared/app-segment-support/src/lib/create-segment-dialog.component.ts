import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-segment-dialog',
  template: ` <app-dialog-header title="Create a segment"></app-dialog-header>
    <div mat-dialog-content>
      <app-common-input [control]="form.controls.label" placeholder="Label"></app-common-input>

      <app-common-input
        placeholder="start"
        [control]="form.controls.start"
        type="number"
        data-cy="start-input"></app-common-input>
      <app-common-input
        placeholder="end"
        [control]="form.controls.end"
        type="number"
        data-cy="end-input"></app-common-input>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close data-cy="cancel-button">Cancel</button>
      <button
        data-cy="submit-button"
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form.invalid"
        (click)="onSubmit()">
        Submit
      </button>
    </div>`,
})
export class CreateSegmentDialogComponent {
  loading = false;

  form = this._fb.group({
    label: ['', Validators.required],
    start: [0, Validators.required],
    end: [0, Validators.required],
  });

  constructor(private _fb: FormBuilder) {}

  onSubmit() {}
}
