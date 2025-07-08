import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Constants, ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { SetUserAction, UserSelectors } from '@dasch-swiss/vre/core/state';
import { EditUserDialogComponent } from '@dasch-swiss/vre/pages/user-settings/user';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Actions, Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { EditPasswordDialogComponent } from '../edit-password-dialog.component';
import { ManageProjectMembershipDialogComponent } from '../manage-project-membership-dialog.component';

@Component({
  selector: 'app-users-list-row-menu',
  template: `
    <button mat-icon-button *ngIf="isSysAdmin$ | async" [matMenuTriggerFor]="projectUserMenu" data-cy="user-menu">
      <mat-icon>more_horiz</mat-icon>
    </button>

    <mat-menu #projectUserMenu="matMenu" xPosition="before">
      <!-- update user's system admin group membership; only in system admin view -->
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
    </mat-menu>
  `,
})
export class UsersListRowMenuComponent implements OnDestroy {
  @Input({ required: true }) user!: ReadUser;
  @Output() refreshParent = new EventEmitter<void>();

  private readonly _destroy$ = new Subject<void>();

  isSysAdmin$ = this._store.select(UserSelectors.isSysAdmin);
  username$ = this._store.select(UserSelectors.username);

  constructor(
    private _matDialog: MatDialog,
    private _actions$: Actions,
    private _store: Store,
    private _dialog: DialogService,
    private readonly _userApiService: UserApiService
  ) {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

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

  editUser(user: ReadUser) {
    const dialogConfig = DspDialogConfig.dialogDrawerConfig<ReadUser>(user, true);
    const dialogRef = this._matDialog.open(EditUserDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.refreshParent.emit();
    });
  }

  openEditPasswordDialog(user: ReadUser) {
    this._matDialog
      .open(EditPasswordDialogComponent, DspDialogConfig.dialogDrawerConfig({ user }, true))
      .afterClosed()
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
    this._userApiService.delete(userIri).subscribe(response => {
      this._store.dispatch(new SetUserAction(response.user));
      this.refreshParent.emit();
    });
  }

  private activateUser(userIri: string) {
    this._userApiService.updateStatus(userIri, true).subscribe(response => {
      this._store.dispatch(new SetUserAction(response.user));
      this.refreshParent.emit();
    });
  }
}
