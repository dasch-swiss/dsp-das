import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Constants, ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';
import { UserApiService } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants, DspDialogConfig } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService, SortingService } from '@dasch-swiss/vre/shared/app-helper-services';
import {
  LoadProjectMembersAction,
  LoadProjectMembershipAction,
  LoadUserAction,
  ProjectsSelectors,
  RemoveUserFromProjectAction,
  SetUserAction,
  UserSelectors,
} from '@dasch-swiss/vre/shared/app-state';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { DialogComponent } from '../../../main/dialog/dialog.component';
import { DialogService } from '../../../main/services/dialog.service';
import { CreateUserPageComponent } from '../../../user/create-user-page/create-user-page.component';
import { EditUserPageComponent } from '../../../user/edit-user-page/edit-user-page.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  // list of users: status active or inactive (deleted)
  @Input() status: boolean;

  // list of users: depending on the parent
  @Input() list: ReadUser[];

  // enable the button to create new user
  @Input() createNew = false;

  // proje0ct data
  @Input() project: ReadProject;

  // in case of modification
  @Output() refreshParent: EventEmitter<any> = new EventEmitter<any>();

  // i18n plural mapping
  itemPluralMapping = {
    user: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '=1': '1 User',
      other: '# Users',
    },
    member: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '=1': '1 Member',
      other: '# Members',
    },
  };

  //
  // project view
  // dsp-js admin group iri
  adminGroupIri: string = Constants.ProjectAdminGroupIRI;

  // project uuid; as identifier in project application state service
  projectUuid: string;

  //
  // sort properties
  sortProps: any = [
    {
      key: 'familyName',
      label: 'Last name',
    },
    {
      key: 'givenName',
      label: 'First name',
    },
    {
      key: 'email',
      label: 'E-mail',
    },
    {
      key: 'username',
      label: 'Username',
    },
  ];

  // ... and sort by 'username'
  sortBy = 'username';

  disableMenu$: Observable<boolean> = combineLatest([
    this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin),
    this._store.select(UserSelectors.isSysAdmin),
  ]).pipe(
    map(([isCurrentProjectAdminOrSysAdmin, isSysAdmin]) => {
      if (this.project && this.project.status === false) {
        return true;
      } else {
        const isProjectAdmin = this.projectUuid ? isCurrentProjectAdminOrSysAdmin : false;
        return !isProjectAdmin && !isSysAdmin;
      }
    })
  );

  @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
  @Select(UserSelectors.username) username$: Observable<string>;
  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isCurrentProjectAdminOrSysAdmin$: Observable<boolean>;
  @Select(ProjectsSelectors.currentProject) project$: Observable<ReadProject>;
  @Select(UserSelectors.isLoading) isUsersLoading$: Observable<boolean>;

  constructor(
    private _userApiService: UserApiService,
    private _matDialog: MatDialog,
    private _dialog: DialogService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _sortingService: SortingService,
    private _store: Store,
    private _actions$: Actions,
    private _cd: ChangeDetectorRef
  ) {
    // get the uuid of the current project
    this._route.parent.parent.paramMap.subscribe((params: Params) => {
      this.projectUuid = params.get('uuid');
    });
  }

  ngOnInit() {
    // sort list by defined key
    if (localStorage.getItem('sortUsersBy')) {
      this.sortBy = localStorage.getItem('sortUsersBy');
    } else {
      localStorage.setItem('sortUsersBy', this.sortBy);
    }
  }

  trackByFn = (index: number, item: ReadUser) => `${index}-${item.id}`;

  /**
   * returns true, when the user is project admin;
   * when the parameter permissions is not set,
   * it returns the value for the logged-in user
   *
   *
   * @param  [permissions] user's permissions
   * @returns boolean
   */
  userIsProjectAdmin(permissions?: PermissionsData): boolean {
    if (!this.project) {
      return false;
    }

    return ProjectService.IsMemberOfProjectAdminGroup(permissions.groupsPerProject, this.project.id);
  }

  /**
   * returns true, when the user is system admin
   *
   * @param permissions PermissionData from user profile
   */
  userIsSystemAdmin(permissions: PermissionsData): boolean {
    let admin = false;
    const groupsPerProjectKeys: string[] = Object.keys(permissions.groupsPerProject);

    for (const key of groupsPerProjectKeys) {
      if (key === Constants.SystemProjectIRI) {
        admin = permissions.groupsPerProject[key].indexOf(Constants.SystemAdminGroupIRI) > -1;
      }
    }

    return admin;
  }

  /**
   * update user's group memebership
   */
  updateGroupsMembership(id: string, groups: string[]): void {
    if (!groups) {
      return;
    }

    const currentUserGroups: string[] = [];
    this._userApiService.getGroupMembershipsForUser(id).subscribe(response => {
      for (const group of response.groups) {
        currentUserGroups.push(group.id);
      }

      if (currentUserGroups.length === 0) {
        // add user to group
        // console.log('add user to group');
        for (const newGroup of groups) {
          this.addUserToGroupMembership(id, newGroup);
        }
      } else {
        // which one is deselected?
        // find id in groups --> if not exists: remove from group
        for (const oldGroup of currentUserGroups) {
          if (groups.indexOf(oldGroup) === -1) {
            // console.log('remove from group', oldGroup);
            // the old group is not anymore one of the selected groups --> remove user from group
            this._userApiService
              .removeFromGroupMembership(id, oldGroup)
              .pipe(take(1))
              .subscribe(() => {
                if (this.projectUuid) {
                  this._store.dispatch(new LoadProjectMembershipAction(this.projectUuid));
                }
              });
          }
        }
        for (const newGroup of groups) {
          if (currentUserGroups.indexOf(newGroup) === -1) {
            this.addUserToGroupMembership(id, newGroup);
          }
        }
      }
    });
  }

  /**
   * update user's admin-group membership
   */
  updateProjectAdminMembership(id: string, permissions: PermissionsData): void {
    const currentUser = this._store.selectSnapshot(UserSelectors.user);
    const userIsProjectAdmin = this.userIsProjectAdmin(permissions);
    if (userIsProjectAdmin) {
      // true = user is already project admin --> remove from admin rights
      this._userApiService.removeFromProjectMembership(id, this.project.id, true).subscribe(response => {
        // if this user is not the logged-in user
        if (currentUser.username !== response.user.username) {
          this._store.dispatch(new SetUserAction(response.user));
          this.refreshParent.emit();
        } else {
          // the logged-in user removed himself as project admin
          // the list is not available anymore;
          // open dialog to confirm and
          // redirect to project page
          // update the application state of logged-in user and the session
          this._store.dispatch(new LoadUserAction(currentUser.username));
          this._actions$
            .pipe(ofActionSuccessful(LoadUserAction))
            .pipe(take(1))
            .subscribe(() => {
              const isSysAdmin = ProjectService.IsMemberOfSystemAdminGroup(
                (currentUser as ReadUser).permissions.groupsPerProject
              );
              if (isSysAdmin) {
                this.refreshParent.emit();
              } else {
                // logged-in user is NOT system admin:
                // go to project page and reload project admin interface
                this._router
                  .navigateByUrl(RouteConstants.refreshRelative, {
                    skipLocationChange: true,
                  })
                  .then(() => this._router.navigate([`${RouteConstants.projectRelative}/${this.projectUuid}`]));
              }
            });
        }
      });
    } else {
      // false: user isn't project admin yet --> add admin rights
      this._userApiService.addToProjectMembership(id, this.project.id, true).subscribe(response => {
        if (currentUser.username !== response.user.username) {
          this._store.dispatch(new SetUserAction(response.user));
          this.refreshParent.emit();
        } else {
          // the logged-in user (system admin) added himself as project admin
          // update the application state of logged-in user and the session
          this._store.dispatch(new LoadUserAction(currentUser.username));
          this._actions$
            .pipe(ofActionSuccessful(LoadUserAction))
            .pipe(take(1))
            .subscribe(() => {
              this.refreshParent.emit();
            });
        }
      });
    }
  }

  updateSystemAdminMembership(user: ReadUser, systemAdmin: boolean): void {
    this._userApiService
      .updateSystemAdminMembership(user.id, systemAdmin)
      .pipe(take(1))
      .subscribe(response => {
        this._store.dispatch(new SetUserAction(response.user));
        if (this._store.selectSnapshot(UserSelectors.username) !== user.username) {
          this.refreshParent.emit();
        }
      });
  }

  askToActivateUser(username: string, id: string) {
    this._dialog.afterConfirmation(`Do you want to reactivate user ${username}?`).subscribe(() => {
      this.activateUser(id);
    });
  }

  askToDeleteUser(username: string, id: string) {
    this._dialog.afterConfirmation(`Do you want to suspend user ${username}?`).subscribe(() => {
      this.deleteUser(id);
    });
  }

  askToRemoveFromProject(user: ReadUser) {
    this._dialog
      .afterConfirmation('Do you want to remove this user from the project?')
      .pipe(
        switchMap(() => {
          this._store.dispatch(new RemoveUserFromProjectAction(user.id, this.project.id));
          return this._actions$.pipe(ofActionSuccessful(LoadProjectMembersAction));
        })
      )
      .subscribe();
  }

  createUser() {
    const dialogRef = this._matDialog.open(CreateUserPageComponent, DspDialogConfig.dialogDrawerConfig());
    dialogRef.afterClosed().subscribe(() => {
      this.refreshParent.emit();
    });
  }

  editUser(user: ReadUser) {
    const dialogConfig = DspDialogConfig.dialogDrawerConfig<ReadUser>(user);
    const dialogRef = this._matDialog.open(EditUserPageComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.refreshParent.emit();
    });
  }

  /**
   * open dialog in every case of modification:
   * edit user profile data, update user's password,
   * remove user from project or toggle project admin membership,
   * delete and reactivate user
   *
   */
  openDialog(mode: string, user?: ReadUser): void {
    const dialogConfig: MatDialogConfig = {
      width: '560px',
      maxHeight: '80vh',
      position: {
        top: '112px',
      },
      data: { user, mode },
    };

    const dialogRef = this._matDialog.open(DialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(response => {
      if (response === true) {
        switch (mode) {
          case 'removeFromProject':
            this._store.dispatch(new RemoveUserFromProjectAction(user.id, this.project.id));
            this._actions$
              .pipe(ofActionSuccessful(LoadProjectMembersAction))
              .pipe(take(1))
              .subscribe(() => {
                this.refreshParent.emit();
              });
            break;
          case 'deleteUser':
            this.deleteUser(user.id);
            break;
          case 'activateUser':
            this.activateUser(user.id);
            break;
        }
      }
      this._cd.markForCheck();
    });
  }

  /**
   * delete resp. deactivate user
   *
   * @param id user's IRI
   */
  deleteUser(id: string) {
    this._userApiService
      .delete(id)
      .pipe(take(1))
      .subscribe(response => {
        this._store.dispatch(new SetUserAction(response.user));
        this.refreshParent.emit();
      });
  }

  /**
   * reactivate user
   *
   * @param id user's IRI
   */
  activateUser(id: string) {
    this._userApiService
      .updateStatus(id, true)
      .pipe(take(1))
      .subscribe(response => {
        this._store.dispatch(new SetUserAction(response.user));
        this.refreshParent.emit();
      });
  }

  sortList(key: any) {
    this.sortBy = key;
    this.list = this._sortingService.keySortByAlphabetical(this.list, this.sortBy as any);
    localStorage.setItem('sortUsersBy', key);
  }

  private addUserToGroupMembership(id: string, newGroup: string): void {
    this._userApiService
      .addToGroupMembership(id, newGroup)
      .pipe(take(1))
      .subscribe(() => {
        if (this.projectUuid) {
          this._store.dispatch(new LoadProjectMembershipAction(this.projectUuid));
        }
      });
  }
}
