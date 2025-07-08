import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import {
  LoadProjectMembersAction,
  RemoveUserFromProjectAction,
  SetUserAction,
  UserSelectors,
} from '@dasch-swiss/vre/core/state';
import { EditUserDialogComponent } from '@dasch-swiss/vre/pages/user-settings/user';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { EditPasswordDialogComponent } from '../edit-password-dialog.component';
import { ManageProjectMembershipDialogComponent } from '../manage-project-membership-dialog.component';

@Component({
  selector: 'app-users-list-row-menu',
  template: `
    <button
      mat-icon-button
      *ngIf="isSysAdmin$ | async"
      [matMenuTriggerFor]="projectUserMenu"
      data-cy="user-menu"
      [disabled]="disableMenu$ | async">
      <mat-icon>more_horiz</mat-icon>
    </button>

    <mat-menu #projectUserMenu="matMenu" xPosition="before" class="menu">
      <!-- update user's system admin group membership; only in system admin view -->
      <button
        mat-menu-item
        *ngIf="user.username !== (username$ | async)"
        (click)="updateSystemAdminMembership(user, !isSystemAdmin(user.permissions))">
        <span> {{ isSystemAdmin(user.permissions) ? 'Add' : 'Remove' }}</span>
        <span>as system admin</span>
      </button>
      <!-- update user's profile data; only for system admin -->
      <ng-container *ngIf="user.status">
        <button mat-menu-item (click)="editUser(user)">'Edit user'</button>

        <button mat-menu-item (click)="openEditPasswordDialog(user)">Change user's password</button>

        <button mat-menu-item (click)="openManageProjectMembershipDialog(user)">Manage project membership</button>

        <button mat-menu-item (click)="askToDeactivateUser(user.username, user.id)">Suspend user</button>
      </ng-container>

      <button mat-menu-item *ngIf="!user.status" (click)="askToActivateUser(user.username, user.id)">
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
