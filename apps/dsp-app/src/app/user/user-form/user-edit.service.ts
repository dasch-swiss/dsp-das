import { Injectable } from '@angular/core';
import { ReadUser, UpdateUserRequest, User } from '@dasch-swiss/dsp-js';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { CreateUserAction, LoadUsersAction, UpdateUserAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { UserForm, UserToEdit } from './user-form.type';

@Injectable()
export class UserEditService {
  @Select(UserSelectors.allUsers) private allUsers$: Observable<ReadUser[]>;
  private _enrollToProject = ''; // project Iri to add a new user as member to
  private _userId = '';

  existingUserNames$: Observable<RegExp[]>;
  existingUserEmails$: Observable<RegExp[]>;

  transactionDone = new Subject<boolean>();

  constructor(
    private _actions$: Actions,
    private _notification: NotificationService,
    private _projectService: ProjectService,
    private _store: Store
  ) {
    this.existingUserNames$ = this.allUsers$.pipe(
      map(allUsers => allUsers.map(user => new RegExp(`(?:^|\\W)${user.username.toLowerCase()}(?:$|\\W)`)))
    );

    this.existingUserEmails$ = this.allUsers$.pipe(
      map(allUsers => allUsers.map(user => new RegExp(`(?:^|\\W)${user.email.toLowerCase()}(?:$|\\W)`)))
    );
  }

  getUser$(userToEdit: UserToEdit): Observable<ReadUser> {
    this._userId = userToEdit?.userId || '';
    this._enrollToProject = userToEdit?.projectUuid ? this._projectService.uuidToIri(userToEdit.projectUuid) : '';
    return this.allUsers$.pipe(
      switchMap(allUsers => {
        if (allUsers.length === 0) {
          this._store.dispatch(new LoadUsersAction(true));
        }
        const user = allUsers.find(u => u?.id === userToEdit?.userId);
        return of(user || new ReadUser());
      })
    );
  }

  submitUserForm(form: UserForm) {
    if (this._userId) {
      this._updateUser(form);
    } else {
      this._createUser(form);
    }
  }

  private _updateUser(form: UserForm): void {
    const userUpdate: UpdateUserRequest = {
      familyName: form.controls.familyName.value,
      givenName: form.controls.givenName.value,
      lang: form.controls.lang.value,
    };
    this._store.dispatch(new UpdateUserAction(this._userId, userUpdate));
    this._actions$.pipe(ofActionSuccessful(UpdateUserAction), take(1)).subscribe(() => {
      this._onSubmittted();
    });
  }

  private _createUser(form: UserForm): void {
    const user = new User();
    user.familyName = form.controls.familyName.value;
    user.givenName = form.controls.givenName.value;
    user.email = form.controls.email.value;
    user.username = form.controls.username.value;
    user.password = form.controls.password.value;
    user.lang = form.controls.lang.value;
    user.systemAdmin = form.controls.systemAdmin.value;
    user.status = true;

    this._store.dispatch(new CreateUserAction(user, this._enrollToProject));
    this._actions$.pipe(ofActionSuccessful(CreateUserAction), take(1)).subscribe(() => {
      this._onSubmittted();
    });
  }

  private _onSubmittted() {
    const action = this._userId ? 'updated the' : 'created a';
    const notification = this._enrollToProject
      ? `You have successfully ${action} user's profile and added the user to the project.`
      : `You have successfully ${action} user's profile`;
    this._notification.openSnackBar(notification);
    this.transactionDone.next(true);
  }
}
