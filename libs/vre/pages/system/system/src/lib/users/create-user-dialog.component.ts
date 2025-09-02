import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { User } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { UserForm } from '@dasch-swiss/vre/pages/user-settings/user';
import { CustomRegex } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-create-user-dialog',
  template: `
    <app-user-form [data]="data" (afterFormInit)="afterFormInit($event)" />
    <app-password-form-2 [control]="form.controls.password" />

    <div mat-dialog-actions align="end">
      <button color="primary" mat-button mat-dialog-close>{{ 'ui.form.action.cancel' | translate }}</button>
      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="isLoading"
        [disabled]="!form?.valid || isLoading"
        (click)="createUser()">
        {{ 'ui.form.action.submit' | translate }}
      </button>
    </div>
  `,
})
export class CreateUserDialogComponent {
  form!: FormGroup<{ user: UserForm; password: FormControl<string> }>;
  isLoading = false;

  readonly data = { givenName: '', familyName: '', email: '', username: '', lang: 'en', isSystemAdmin: false };

  constructor(
    private readonly _dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private readonly _userApiService: UserApiService,
    private _fb: FormBuilder
  ) {}

  afterFormInit(form: UserForm): void {
    this.form = this._fb.nonNullable.group({
      user: form,
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(CustomRegex.PASSWORD_REGEX)]],
    });
  }

  createUser(): void {
    this.isLoading = true;

    const userFormControls = this.form.controls.user.controls;

    const user = new User();
    user.familyName = userFormControls.familyName.value;
    user.givenName = userFormControls.givenName.value;
    user.email = userFormControls.email.value;
    user.username = userFormControls.username.value;
    user.password = this.form.controls.password.value;
    user.lang = userFormControls.lang.value;
    user.systemAdmin = userFormControls.systemAdmin.value;
    user.status = true;

    this._userApiService.create(user).subscribe(response => {
      this.isLoading = false;
      this._dialogRef.close(response.user.id);
    });
  }
}
