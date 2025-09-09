import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatStepper, MatStep } from '@angular/material/stepper';
import { KnoraApiConnection, ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { DialogHeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { LoadingButtonDirective } from '@dasch-swiss/vre/ui/progress-indicator';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { PasswordConfirmFormComponent } from './user-form/password-form/password-confirm-form.component';
import { PasswordFormFieldComponent } from './user-form/password-form/password-form-field.component';

export interface EditPasswordDialogProps {
  user: ReadUser;
}

@Component({
  selector: 'app-edit-password-dialog',
  template: `
    <app-dialog-header [title]="data.user.username" [subtitle]="'pages.system.users.changePassword' | translate" />

    <mat-stepper orientation="vertical" linear #stepper>
      <mat-step
        [label]="'For security reasons, please enter your current password'"
        [stepControl]="adminPasswordControl"
        [editable]="false">
        <app-password-form-field
          [control]="adminPasswordControl"
          [placeholder]="'Your current password'"
          [showToggleVisibility]="true"
          [validatorErrors]="[{ errorKey: 'incorrect', message: 'The password entered is incorrect' }]" />

        <button mat-raised-button color="primary" (click)="checkAdminPassword()">Next</button>
      </mat-step>

      <mat-step [label]="'Enter the new password'">
        <app-password-confirm-form (afterFormInit)="newPasswordControl = $event" />

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

    <div mat-dialog-actions align="end"><button mat-button color="primary" matDialogClose>Cancel</button></div>
  `,
  styles: [
    `
      :host ::ng-deep .mat-vertical-content-container {
        margin-top: 16px;
      }
    `,
  ],
  standalone: true,
  imports: [
    DialogHeaderComponent,
    MatStepper,
    MatStep,
    PasswordFormFieldComponent,
    MatButton,
    PasswordConfirmFormComponent,
    LoadingButtonDirective,
    MatDialogActions,
    MatDialogClose,
    TranslateModule,
  ],
})
export class EditPasswordDialogComponent {
  @ViewChild('stepper') stepper!: MatStepper;

  adminPasswordControl = this._fb.nonNullable.control('', [Validators.required]);
  newPasswordControl!: FormControl<string>;

  updateLoading = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditPasswordDialogProps,
    public dialogRef: MatDialogRef<EditPasswordDialogComponent>,
    private _userApiService: UserApiService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _fb: FormBuilder,
    private _userService: UserService
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
