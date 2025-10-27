import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { User } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { UserForm } from '@dasch-swiss/vre/pages/user-settings/user';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-create-user-dialog',
  template: `
    <app-dialog-header [title]="'pages.system.createUserDialog.title' | translate" />
    <div mat-dialog-content>
      <app-user-form [data]="data" (afterFormInit)="afterUserFormInit($event)" />
      <app-password-confirm-form (afterFormInit)="afterPasswordFormInit($event)" />
      <mat-slide-toggle [formControl]="form.controls.isSystemAdmin">{{
        'pages.system.createUserDialog.isSystemAdmin' | translate
      }}</mat-slide-toggle>
    </div>

    <div mat-dialog-actions align="end">
      <button color="primary" mat-button mat-dialog-close>{{ 'ui.common.actions.cancel' | translate }}</button>
      <button mat-raised-button color="primary" appLoadingButton [isLoading]="isLoading" (click)="createUser()">
        {{ 'ui.common.actions.submit' | translate }}
      </button>
    </div>
  `,
  standalone: false,
})
export class CreateUserDialogComponent implements OnInit {
  form = this._fb.group(
    {} as {
      user: UserForm;
      password: FormControl<string>;
      isSystemAdmin: FormControl<boolean>;
    }
  );
  isLoading = false;

  readonly data = { givenName: '', familyName: '', email: '', username: '', lang: 'en', isSystemAdmin: false };

  constructor(
    private readonly _dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private readonly _userApiService: UserApiService,
    private readonly _fb: FormBuilder
  ) {}

  ngOnInit() {
    this.form.addControl('isSystemAdmin', this._fb.control(false, { nonNullable: true }));
  }

  afterUserFormInit(form: UserForm): void {
    this.form.addControl('user', form);
  }

  afterPasswordFormInit(form: FormControl<string>): void {
    this.form.addControl('password', form);
  }

  createUser(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      return;
    }
    this.isLoading = true;

    const userFormControls = this.form.controls.user.controls;

    const user = new User();
    user.familyName = userFormControls.familyName.value;
    user.givenName = userFormControls.givenName.value;
    user.email = userFormControls.email.value;
    user.username = userFormControls.username.value;
    user.password = this.form.controls.password.value;
    user.lang = userFormControls.lang.value;
    user.systemAdmin = this.form.controls.isSystemAdmin.value;
    user.status = true;

    this._userApiService
      .create(user)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(response => {
        this._dialogRef.close(response.user.id);
      });
  }
}
