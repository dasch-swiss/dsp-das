import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReadUser, User } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { UserForm } from '@dasch-swiss/vre/pages/user-settings/user';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';

@Component({
  selector: 'app-create-user-dialog',
  template: `
    <app-user-form [user]="user" (afterFormInit)="form = $event" />

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
  user = new ReadUser();
  form!: UserForm;
  isLoading = false;

  constructor(
    private readonly _dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private readonly _notification: NotificationService,
    private readonly _userApiService: UserApiService,
    @Inject(MAT_DIALOG_DATA) public projectUuId: string
  ) {}

  createUser(): void {
    this.isLoading = true;

    const user = new User();
    user.familyName = this.form.controls.familyName.value;
    user.givenName = this.form.controls.givenName.value;
    user.email = this.form.controls.email.value;
    user.username = this.form.controls.username.value;
    user.password = this.form.controls.password.value;
    user.lang = this.form.controls.lang.value;
    user.systemAdmin = this.form.controls.systemAdmin.value;
    user.status = true;

    this._userApiService.create(user).subscribe(() => {
      this.isLoading = false;
      this._dialogRef.close(true);

      const enrolled = this.projectUuId ? ' and added the user to the project' : '';
      this._notification.openSnackBar(`You have successfully created a user's profile${enrolled}.`);
    });
  }
}
