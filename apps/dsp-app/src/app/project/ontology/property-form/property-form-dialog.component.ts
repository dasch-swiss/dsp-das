import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-property-form-dialog',
  template: `<app-dialog-header title="Create a new property"> </app-dialog-header>
    <mat-dialog-content>
      <app-property-form-2 (formValueChange)="form = $event"></app-property-form-2>
    </mat-dialog-content>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
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
export class PropertyFormDialogComponent {
  loading = false;
  form: FormGroup;

  onSubmit() {}

  constructor(private dialogRef: MatDialogRef<PropertyFormDialogComponent, boolean>) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
  }
}
