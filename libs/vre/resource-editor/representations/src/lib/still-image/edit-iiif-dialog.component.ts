import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface IiifDialogProps {
  resourceId: string;
  externalUrl: string;
}

@Component({
  selector: 'app-edit-third-party-iiif-dialog',
  template: `
    <app-iiif-control [control]="control" />
    <div mat-dialog-actions align="end">
      <button color="primary" mat-button mat-dialog-close>{{ 'ui.form.action.cancel' | translate }}</button>
      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="!control?.valid || loading"
        (click)="submitData()"
        data-cy="submit-button">
        {{ 'ui.form.action.submit' | translate }}
      </button>
    </div>
  `,
})
export class EditIiifDialogComponent {
  control = new FormControl(this.data.externalUrl, [Validators.required]);
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IiifDialogProps,
    private _dialogRef: MatDialogRef<IiifDialogProps>
  ) {}

  submitData() {
    this.loading = true;
    this._dialogRef.close();
  }
}
