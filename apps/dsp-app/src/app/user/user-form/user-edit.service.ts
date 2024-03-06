import { Injectable } from '@angular/core';
import { ReadUser, UpdateUserRequest, User } from '@dasch-swiss/dsp-js';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { CreateUserAction, LoadUsersAction, UpdateUserAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { EditUser } from './user-form-model';

@Injectable()
export class UserEditService {
  @Select(UserSelectors.allUsers) private allUsers$: Observable<ReadUser[]>;
  private _enrollToProject = ''; // project Iri to add a new user as member to

  existingUserNames$: Observable<RegExp[]>;
  existingUserEmails$: Observable<RegExp[]>;

  // emit if a transaction is finished
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

  getUser$(userConfig: EditUser): Observable<ReadUser> {
    this._enrollToProject = userConfig?.projectUuid ? this._projectService.uuidToIri(userConfig.projectUuid) : '';
    return this.allUsers$.pipe(
      switchMap(allUsers => {
        if (allUsers.length === 0) {
          this._store.dispatch(new LoadUsersAction(true));
        }
        const user = allUsers.find(u => u?.id === userConfig?.userId);
        return of(user || new ReadUser());
      })
    );
  }

  createUser(user: User) {
    this._store.dispatch(new CreateUserAction(user, this._enrollToProject));
    this._actions$.pipe(ofActionSuccessful(CreateUserAction), take(1)).subscribe(() => {
      this._onSubmittted();
    });
  }

  updateUser(userId: string, user: UpdateUserRequest) {
    this._store.dispatch(new UpdateUserAction(userId, user));
    this._actions$.pipe(ofActionSuccessful(UpdateUserAction), take(1)).subscribe(() => {
      this._onSubmittted(!!userId);
    });
  }

  private _onSubmittted(existingUser = false) {
    const action = existingUser ? 'updated the' : 'created a';
    const notification = this._enrollToProject
      ? `You have successfully ${action} user's profile and added the user to the project.`
      : `You have successfully ${action} user's profile`;
    this._notification.openSnackBar(notification);
    this.transactionDone.next(true);
  }
}
