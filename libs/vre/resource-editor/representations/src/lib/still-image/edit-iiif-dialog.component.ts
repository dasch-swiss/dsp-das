import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReadStillImageExternalFileValue } from '@dasch-swiss/dsp-js';

export interface IiifDialogProps {
  resourceId: string;
  fileValue: ReadStillImageExternalFileValue;
}

@Component({
  selector: 'app-edit-third-party-iiif-dialog',
  template: `
    <form [formGroup]="form">
      <app-third-part-iiif [formControl]="form.controls.fileValue" />
    </form>
    <div mat-dialog-actions align="end">
      <button color="primary" mat-button mat-dialog-close>{{ 'ui.form.action.cancel' | translate }}</button>
      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="!form?.valid || loading"
        (click)="submitData()"
        data-cy="submit-button">
        {{ 'ui.form.action.submit' | translate }}
      </button>
    </div>
  `,
})
export class EditIiifDialogComponent {
  form = new FormGroup({
    fileValue: new FormControl(this.data.fileValue, [Validators.required]),
  });

  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IiifDialogProps,
    public dialogRef: MatDialogRef<IiifDialogProps>
  ) {}

  submitData() {
    this.loading = true;
    delete (this.form.value.fileValue as any)?.filename;
    this.dialogRef.close(this.form.value.fileValue);
  }
}
