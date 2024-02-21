import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReadUser, User } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import {
  AddUserToProjectMembershipAction,
  CreateUserAction,
  LoadUsersAction,
  UpdateUserAction,
  UserSelectors,
} from '@dasch-swiss/vre/shared/app-state';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap, take, tap } from 'rxjs/operators';

/**
 * UserEditService provides the user to edit as well all business logic for
 * creating and updating users via the user form.
 */
@Injectable()
export class UserEditService {
  user$: Observable<ReadUser>; // user to edit
  existingUserNames$: Observable<RegExp[]>;
  existingUserEmails$: Observable<RegExp[]>;

  @Select(UserSelectors.allUsers) private allUsers$: Observable<ReadUser[]>;

  withProjectMembership: string; // project Iri to add a new user to

  constructor(
    private _actions$: Actions,
    private _notification: NotificationService,
    private _projectService: ProjectService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store
  ) {
    // load users if not already loaded
    this.allUsers$
      .pipe(
        take(1),
        tap(allUsers => {
          if (allUsers.length === 0) {
            this._store.dispatch(new LoadUsersAction(true));
          }
        })
      )
      .subscribe();

    this.user$ = this._getUser$();

    this.existingUserNames$ = this.allUsers$.pipe(
      map(allUsers => allUsers.map(user => new RegExp(`(?:^|\\W)${user.username.toLowerCase()}(?:$|\\W)`)))
    );

    this.existingUserEmails$ = this.allUsers$.pipe(
      map(allUsers => allUsers.map(user => new RegExp(`(?:^|\\W)${user.email.toLowerCase()}(?:$|\\W)`)))
    );

    this.withProjectMembership = this._projectService.uuidToIri(this._route.snapshot.queryParams.projectUuid);
  }

  private _getUser$(): Observable<ReadUser> {
    if (this._route.snapshot.url[0].path === RouteConstants.createNew) {
      return of(new ReadUser());
    } else {
      return this._route.paramMap.pipe(
        switchMap(paramMap => {
          const userId = paramMap.get(RouteConstants.userParameter)
            ? `http://rdfh.ch/users/${paramMap.get(RouteConstants.userParameter)}`
            : '';
          return userId ? this.allUsers$.pipe(map(allUsers => allUsers.find(user => user.id === userId))) : of(null);
        })
      );
    }
  }

  private _getUserByUsername$(username: string): Observable<ReadUser> {
    return this.allUsers$.pipe(map(allUsers => allUsers.find(user => user.username === username)));
  }

  createUser(user: User) {
    this._store.dispatch(new CreateUserAction(user));
    this._actions$.pipe(ofActionSuccessful(CreateUserAction), take(1)).subscribe(() => {
      if (this.withProjectMembership) {
        // add the new user to the project membership
        combineLatest([
          this._actions$.pipe(ofActionSuccessful(CreateUserAction)),
          this._getUserByUsername$(user.username),
        ])
          .pipe(take(1))
          .subscribe(([loadUsersAction, createdUser]) => {
            this._store.dispatch(new AddUserToProjectMembershipAction(createdUser.id, this.withProjectMembership));
            this._notification.openSnackBar("You have successfully created a user's profile");
          });
      }
      // route back to the user list and close the drawer
      this._router.navigate(['../'], { relativeTo: this._route });
    });
  }

  updateUser(user: ReadUser) {
    this._store.dispatch(new UpdateUserAction(user));
    this._actions$.pipe(ofActionSuccessful(UpdateUserAction), take(1)).subscribe(() => {
      // route back to the user list and close the drawer
      this._notification.openSnackBar("You have successfully updated the user's profile data.");

      this._router.navigate(['../'], { relativeTo: this._route });
    });
  }
}
