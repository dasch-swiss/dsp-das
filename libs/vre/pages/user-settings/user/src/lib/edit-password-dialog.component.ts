import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { KnoraApiConnection, ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { finalize } from 'rxjs';

export interface EditPasswordDialogProps {
  user: ReadUser;
}

@Component({
  selector: 'app-edit-password-dialog',
  template: `
    <app-dialog-header [title]="data.user.username" [subtitle]="'pages.system.users.changePassword' | translate" />

    <div mat-dialog-content>
      <mat-stepper orientation="vertical" linear #stepper>
        <mat-step
          [label]="'pages.userSettings.passwordForm.currentPasswordStep' | translate"
          [stepControl]="adminPasswordControl"
          [editable]="false">
          <app-password-form-field
            [control]="adminPasswordControl"
            [placeholder]="'pages.userSettings.passwordForm.currentPasswordPlaceholder' | translate"
            [showToggleVisibility]="true"
            [validatorErrors]="[
              { errorKey: 'incorrect', message: 'pages.userSettings.passwordForm.incorrectPassword' | translate }
            ]" />

          <button mat-raised-button color="primary" (click)="checkAdminPassword()">
            {{ 'pages.userSettings.passwordForm.next' | translate }}
          </button>
        </mat-step>

        <mat-step [label]="'pages.userSettings.passwordForm.newPasswordStep' | translate">
          <app-password-confirm-form (afterFormInit)="newPasswordControl = $event" />

          <button
            mat-raised-button
            color="primary"
            appLoadingButton
            [isLoading]="updateLoading"
            (click)="updateNewPassword()"
            style="margin-top: 16px">
            {{ 'pages.userSettings.passwordForm.update' | translate }}
          </button>
        </mat-step>
      </mat-stepper>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button color="primary" matDialogClose>{{ 'pages.userSettings.passwordForm.cancel' | translate }}</button>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .mat-vertical-content-container {
        margin-top: 16px;
      }
    `,
  ],
  standalone: false,
})
export class EditPasswordDialogComponent {
  @ViewChild('stepper') stepper!: MatStepper;

  adminPasswordControl = this._fb.nonNullable.control('', [Validators.required]);
  newPasswordControl!: FormControl<string>;

  updateLoading = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: EditPasswordDialogProps,
    public readonly dialogRef: MatDialogRef<EditPasswordDialogComponent>,
    private readonly _userApiService: UserApiService,
    @Inject(DspApiConnectionToken)
    private readonly _dspApiConnection: KnoraApiConnection,
    private readonly _fb: FormBuilder,
    private readonly _userService: UserService
  ) {}

  checkAdminPassword() {
    this._dspApiConnection.v2.auth
      .login('iri', this._userService.currentUser!.id, this.adminPasswordControl.value)
      .subscribe(
        () => {
          this.stepper.next();
        },
        e => {
          this.adminPasswordControl.setErrors({ incorrect: true });
        }
      );
  }

  updateNewPassword() {
    this.newPasswordControl.markAllAsTouched();

    if (!this.newPasswordControl.valid) {
      return;
    }

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
