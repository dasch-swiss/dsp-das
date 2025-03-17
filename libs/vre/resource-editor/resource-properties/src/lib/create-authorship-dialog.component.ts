import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminProjectsLegalInfoApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import {
  CreateCopyrightHolderDialogComponent,
  CreateCopyrightHolderDialogProps,
} from '@dasch-swiss/vre/pages/project/project';

@Component({
  selector: 'app-create-authorship-dialog',
  template: ` <app-dialog-header title="Add an authorship" />

    <app-common-input label="Authorship" [control]="form.controls.authorship" />
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form.invalid"
        (click)="onSubmit()">
        Save
      </button>
    </div>
    \`,`,
})
export class CreateAuthorshipDialogComponent {
  form = this._fb.group({
    authorship: this._fb.control('', Validators.required),
  });

  loading = false;

  constructor(
    private _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: CreateCopyrightHolderDialogProps,
    private _adminApi: AdminProjectsLegalInfoApiService,
    private _dialogRef: MatDialogRef<CreateCopyrightHolderDialogComponent>
  ) {}

  onSubmit() {
    if (!this.form.controls.authorship.value) {
      throw new AppError('No authorship');
    }

    this.loading = true;
  }
}
