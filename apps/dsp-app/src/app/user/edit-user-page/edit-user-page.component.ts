import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReadUser, UpdateUserRequest } from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { LoadUsersAction, UpdateUserAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { UserForm } from '../user-form/user-form.type';

@Component({
  selector: 'dsp-app-edit-user-page',
  templateUrl: './edit-user-page.component.html',
})
export class EditUserPageComponent {
  user$: Observable<ReadUser>;

  form: UserForm;

  isLoading$: Observable<boolean>;

  @Select(UserSelectors.allUsers) readonly allUsers$: Observable<ReadUser[]>;

  constructor(
    private _actions$: Actions,
    private _dialogRef: MatDialogRef<EditUserPageComponent>,
    @Inject(MAT_DIALOG_DATA) public userId: string,
    private _notification: NotificationService,
    private _store: Store
  ) {
    this.user$ = this.getUser$();
  }

  private getUser$(): Observable<ReadUser> {
    return this.allUsers$.pipe(
      switchMap(allUsers => {
        if (allUsers.length === 0) {
          this._store.dispatch(new LoadUsersAction(true));
        }
        const user = allUsers.find(u => u?.id === this.userId);
        return of(user);
      })
    );
  }

  updateUser(): void {
    const userUpdate: UpdateUserRequest = {
      familyName: this.form.controls.familyName.value,
      givenName: this.form.controls.givenName.value,
      lang: this.form.controls.lang.value,
    };
    this._store.dispatch(new UpdateUserAction(this.userId, userUpdate));
    this._actions$.pipe(ofActionSuccessful(UpdateUserAction), take(1)).subscribe(() => {
      this._dialogRef.close();
      this._notification.openSnackBar("You successfully updated the user's profile");
    });
  }
}
