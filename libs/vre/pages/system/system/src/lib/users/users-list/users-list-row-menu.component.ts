import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  LoadProjectMembersAction,
  LoadUserAction,
  RemoveUserFromProjectAction,
  SetUserAction,
  UserSelectors,
} from '@dasch-swiss/vre/core/state';
import { EditUserDialogComponent } from '@dasch-swiss/vre/pages/user-settings/user';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { EditPasswordDialogComponent } from '../edit-password-dialog.component';
import { ManageProjectMembershipDialogComponent } from '../manage-project-membership-dialog.component';

@Component({
  selector: 'app-users-list-row-menu',
  template: `
    <button mat-icon-button [matMenuTriggerFor]="projectUserMenu" data-cy="user-menu" [disabled]="disableMenu$ | async">
      <mat-icon>more_horiz</mat-icon>
    </button>

    <mat-menu #projectUserMenu="matMenu" xPosition="before" class="menu">
      <!-- update user's admin group membership; only in project view -->
      <button
        mat-menu-item
        *ngIf="projectUuid && user.status"
        (click)="updateProjectAdminMembership(user.id, user.permissions)">
        <span *ngIf="!isProjectAdmin(user.permissions)">Add</span>
        <span *ngIf="isProjectAdmin(user.permissions)">Remove</span>
        <span>as project admin</span>
      </button>
      <!-- update user's system admin group membership; only in system admin view -->
      <button
        mat-menu-item
        *ngIf="!projectUuid && (isSysAdmin$ | async) && user.username !== (username$ | async)"
        (click)="updateSystemAdminMembership(user, !isSystemAdmin(user.permissions))">
        <span *ngIf="!isSystemAdmin(user.permissions)">Add</span>
        <span *ngIf="isSystemAdmin(user.permissions)">Remove</span>
        <span>as system admin</span>
      </button>
      <!-- update user's profile data; only for system admin -->
      <button mat-menu-item *ngIf="(isSysAdmin$ | async) && user.status" (click)="editUser(user)">
        {{ projectUuid ? 'Edit member' : 'Edit user' }}
      </button>
      <button mat-menu-item *ngIf="(isSysAdmin$ | async) && user.status" (click)="openEditPasswordDialog(user)">
        {{ projectUuid ? "Change member's password" : "Change user's password" }}
      </button>
      <!-- remove user from project; only in project view -->
      <button mat-menu-item data-cy="remove-member-button" *ngIf="projectUuid" (click)="askToRemoveFromProject(user)">
        Remove member from project
      </button>
      <!-- manage project membership; only in system view -->
      <button
        mat-menu-item
        *ngIf="user.status && (isSysAdmin$ | async) && !projectUuid"
        (click)="openManageProjectMembershipDialog(user)">
        Manage project membership
      </button>
      <!-- delete / reactivate user -->
      <button
        mat-menu-item
        *ngIf="user.status && (isSysAdmin$ | async) && !projectUuid"
        (click)="askToDeactivateUser(user.username, user.id)">
        Suspend user
      </button>
      <button
        mat-menu-item
        *ngIf="!user.status && (isSysAdmin$ | async) && !projectUuid"
        (click)="askToActivateUser(user.username, user.id)">
        Reactivate user
      </button>
    </mat-menu>
  `,
})
export class UsersListRowMenuComponent implements OnDestroy {
  @Input({ required: true }) user!: ReadUser;
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private _matDialog: MatDialog,
    private _actions$: Actions,
    private _store: Store,
    private _dialog: DialogService,
    private _router: Router,
    private readonly _userApiService: UserApiService
  ) {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
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
