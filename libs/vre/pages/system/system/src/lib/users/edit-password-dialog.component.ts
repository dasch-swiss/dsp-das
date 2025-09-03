import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { finalize } from 'rxjs';

export interface EditPasswordDialogProps {
  user: ReadUser;
}

@Component({
  selector: 'app-edit-password-dialog',
  template: `
    <app-dialog-header [title]="data.user.username" [subtitle]="'pages.system.users.changePassword' | translate" />

    <mat-stepper orientation="vertical" linear>
      <mat-step [label]="'For security reasons, please enter your admin password'" [stepControl]="adminPasswordControl">
        <app-password-form-field [control]="adminPasswordControl" [placeholder]="'Your admin password'" />
        <button mat-button color="primary" matStepperNext>Next</button>
      </mat-step>

      <mat-step [label]="'Enter the new user password'" [stepControl]="newPasswordControl">
        <app-password-form-2 (afterFormInit)="newPasswordControl = $event" />
        <button
          mat-raised-button
          color="primary"
          appLoadingButton
          [isLoading]="updateLoading"
          (click)="updateNewPassword()"
          style="margin-top: 16px">
          Update
        </button>
      </mat-step>
    </mat-stepper>
  `,
  styles: [
    `
      :host ::ng-deep .mat-vertical-content-container {
        margin-top: 16px;
      }
    `,
  ],
})
export class EditPasswordDialogComponent {
  adminPasswordControl = this._fb.nonNullable.control('', [Validators.required]);
  newPasswordControl!: FormControl<string>;

  updateLoading = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditPasswordDialogProps,
    public dialogRef: MatDialogRef<EditPasswordDialogComponent>,
    private _userApiService: UserApiService,
    private _fb: FormBuilder
  ) {}

  updateNewPassword() {
    this.updateLoading = true;

    this._userApiService
      .updatePassword(this.data.user.id, this.adminPasswordControl.value, this.newPasswordControl.value)
      .pipe(
        finalize(() => {
          this.updateLoading = false;
        })
      )
      .subscribe(() => {
        this.dialogRef.close();
      });
  }
}
