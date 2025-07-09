import { Component, Input } from '@angular/core';
import { Constants, ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  LoadProjectMembersAction,
  LoadProjectMembershipAction,
  LoadUserAction,
  RemoveUserFromProjectAction,
  SetUserAction,
  UserSelectors,
} from '@dasch-swiss/vre/core/state';
import {
  CreateUserDialogComponent,
  EditPasswordDialogComponent,
  ManageProjectMembershipDialogComponent,
} from '@dasch-swiss/vre/pages/system/system';
import { EditUserDialogComponent } from '@dasch-swiss/vre/pages/user-settings/user';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { ofActionSuccessful } from '@ngxs/store';
import { filter, from, merge, mergeMap, switchMap, take, takeLast, takeUntil } from 'rxjs';

@Component({
  selector: 'app-project-members-row-menu',
  template: ` <button mat-icon-button [matMenuTriggerFor]="projectUserMenu" data-cy="user-menu">
      <mat-icon>more_horiz</mat-icon>
    </button>

    <mat-menu #projectUserMenu="matMenu" xPosition="before">
      <button
        mat-menu-item
        *ngIf="user.username !== (username$ | async)"
        (click)="updateSystemAdminMembership(user, !isSystemAdmin(user.permissions))">
        <span> {{ isSystemAdmin(user.permissions) ? 'Add' : 'Remove' }}</span>
        <span>as system admin</span>
      </button>

      <ng-container *ngIf="user.status">
        <button mat-menu-item (click)="editUser(user)">Edit user</button>
        <button mat-menu-item (click)="openEditPasswordDialog(user)">Change user's password</button>
        <button mat-menu-item (click)="openManageProjectMembershipDialog(user)">Manage project membership</button>
        <button mat-menu-item (click)="askToDeactivateUser(user.username, user.id)">Suspend user</button>
      </ng-container>

      <button mat-menu-item *ngIf="!user.status" (click)="askToActivateUser(user.username, user.id)">
        Reactivate user
      </button>
    </mat-menu>`,
})
export class ProjectMembersRowMenuComponent {
  @Input({ required: true }) user!: ReadUser;

  isProjectAdmin(permissions: PermissionsData): boolean {
    if (!permissions.groupsPerProject) {
      return false;
    }

    return ProjectService.IsMemberOfProjectAdminGroup(permissions.groupsPerProject, this.project?.id || '');
  }

  /**
   * Returns true, if the user is system admin.
   */
  isSystemAdmin(permissions: PermissionsData): boolean {
    if (!permissions.groupsPerProject) {
      return false;
    }

    const groupsPerProjectKeys = Object.keys(permissions.groupsPerProject);

    return groupsPerProjectKeys.some(key => {
      if (key === Constants.SystemProjectIRI) {
        return permissions.groupsPerProject?.[key]?.includes(Constants.SystemAdminGroupIRI) ?? false;
      }
      return false;
    });
  }

  updateGroupsMembership(userIri: string, groups: string[]): void {
    if (!groups) {
      return;
    }

    const currentUserGroups: string[] = [];
    this._userApiService
      .getGroupMembershipsForUser(userIri)
      .pipe(takeUntil(this._destroy$))
      .subscribe(response => {
        for (const group of response.groups) {
          currentUserGroups.push(group.id);
        }

        const removeOldGroup$ = from(currentUserGroups).pipe(
          filter(oldGroup => groups.indexOf(oldGroup) === -1), // Filter out groups that are no longer in 'groups'
          mergeMap(oldGroup => this._userApiService.removeFromGroupMembership(userIri, oldGroup).pipe(take(1)))
        );

        const addNewGroup$ = from(groups).pipe(
          filter(newGroup => currentUserGroups.indexOf(newGroup) === -1), // Filter out groups that are already in 'currentUserGroups'
          mergeMap(newGroup => this._userApiService.addToGroupMembership(userIri, newGroup).pipe(take(1)))
        );

        merge(removeOldGroup$, addNewGroup$)
          .pipe(takeLast(1), takeUntil(this._destroy$))
          .subscribe(() => {
            if (this.projectUuid) {
              this._store.dispatch(new LoadProjectMembershipAction(this.projectUuid));
            }
          });
      });
  }

  updateProjectAdminMembership(id: string, permissions: PermissionsData): void {
    const currentUser = this._store.selectSnapshot(UserSelectors.user);
    if (!currentUser) return;

    if (this.isProjectAdmin(permissions)) {
      // true = user is already project admin --> remove from admin rights
      this._userApiService
        .removeFromProjectMembership(id, this.project.id, true)
        .pipe(takeUntil(this._destroy$))
        .subscribe(response => {
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
              .pipe(ofActionSuccessful(LoadUserAction), take(1), takeUntil(this._destroy$))
              .subscribe(() => {
                const isSysAdmin = ProjectService.IsMemberOfSystemAdminGroup(
                  currentUser.permissions?.groupsPerProject || {}
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
      this._userApiService
        .addToProjectMembership(id, this.project.id, true)
        .pipe(takeUntil(this._destroy$))
        .subscribe(response => {
          if (currentUser.username !== response.user.username) {
            this._store.dispatch(new SetUserAction(response.user));
            this.refreshParent.emit();
          } else {
            // the logged-in user (system admin) added himself as project admin
            // update the application state of logged-in user and the session
            this._store.dispatch(new LoadUserAction(currentUser.username));
            this._actions$
              .pipe(ofActionSuccessful(LoadUserAction), take(1), takeUntil(this._destroy$))
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
      .pipe(take(1), takeUntil(this._destroy$))
      .subscribe(response => {
        this._store.dispatch(new SetUserAction(response.user));
        if (this._store.selectSnapshot(UserSelectors.username) !== user.username) {
          this.refreshParent.emit();
        }
      });
  }

  askToActivateUser(username: string, id: string) {
    this._dialog
      .afterConfirmation(`Do you want to reactivate user ${username}?`)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.activateUser(id);
      });
  }

  askToDeactivateUser(username: string, id: string) {
    this._dialog
      .afterConfirmation(`Do you want to suspend user ${username}?`)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.deactivateUser(id);
      });
  }

  askToRemoveFromProject(user: ReadUser) {
    this._dialog
      .afterConfirmation('Do you want to remove this user from the project?')
      .pipe(
        switchMap(() => {
          this._store.dispatch(new RemoveUserFromProjectAction(user.id, this.project.id));
          return this._actions$.pipe(ofActionSuccessful(LoadProjectMembersAction));
        }),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  createUser() {
    const dialogRef = this._matDialog.open(CreateUserDialogComponent, DspDialogConfig.dialogDrawerConfig({}, true));
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.refreshParent.emit();
      });
  }

  editUser(user: ReadUser) {
    const dialogConfig = DspDialogConfig.dialogDrawerConfig<ReadUser>(user, true);
    const dialogRef = this._matDialog.open(EditUserDialogComponent, dialogConfig);
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.refreshParent.emit();
      });
  }

  openEditPasswordDialog(user: ReadUser) {
    this._matDialog
      .open(EditPasswordDialogComponent, DspDialogConfig.dialogDrawerConfig({ user }, true))
      .afterClosed()
      .pipe(takeUntil(this._destroy$))
      .subscribe(response => {
        if (response === true) {
          this.refreshParent.emit();
        }
      });
  }

  openManageProjectMembershipDialog(user: ReadUser): void {
    this._matDialog.open(ManageProjectMembershipDialogComponent, DspDialogConfig.dialogDrawerConfig({ user }, true));
  }

  sortList(key: UserSortKey) {
    this.sortBy = key;
    this.list = this._sortingService.keySortByAlphabetical(this.list, this.sortBy);
    localStorage.setItem('sortUsersBy', key);
  }

  private deactivateUser(userIri: string) {
    this._userApiService
      .delete(userIri)
      .pipe(take(1), takeUntil(this._destroy$))
      .subscribe(response => {
        this._store.dispatch(new SetUserAction(response.user));
        this.refreshParent.emit();
      });
  }

  private activateUser(userIri: string) {
    this._userApiService
      .updateStatus(userIri, true)
      .pipe(take(1), takeUntil(this._destroy$))
      .subscribe(response => {
        this._store.dispatch(new SetUserAction(response.user));
        this.refreshParent.emit();
      });
  }
}
