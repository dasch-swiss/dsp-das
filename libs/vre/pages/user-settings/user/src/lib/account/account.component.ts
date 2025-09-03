import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { AuthService } from '@dasch-swiss/vre/core/session';
import { UserSelectors } from '@dasch-swiss/vre/core/state';
import { EditPasswordDialogComponent, EditPasswordDialogProps } from '@dasch-swiss/vre/pages/system/system';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Store } from '@ngxs/store';
import { EditUserDialogComponent, EditUserDialogProps } from '../edit-user-page/edit-user-dialog.component';

@Component({
  selector: 'app-account',
  template: `
    <div *ngIf="user$ | async as user">
      <mat-card appearance="outlined" style="margin: 16px 0">
        <mat-list style="padding: 0">
          <mat-list-item (click)="onEditProfile(user)" class="selectable">
            <mat-icon matListItemIcon>person</mat-icon>
            <div matLine>Edit my profile</div>
          </mat-list-item>

          <mat-list-item (click)="onEditPassword(user)">
            <mat-icon matListItemIcon>lock</mat-icon>
            <div matLine>Edit my password</div>
          </mat-list-item>
        </mat-list>
      </mat-card>

      <h3>{{ 'pages.userSettings.account.danger' | translate }}</h3>

      <mat-card appearance="outlined">
        <mat-list style="padding: 0">
          <mat-list-item (click)="onDeleteOwnAccount(user)" class="selectable">
            <mat-icon matListItemIcon>warning</mat-icon>
            <div matLine>{{ 'pages.userSettings.account.deleteButton' | translate }}</div>
          </mat-list-item>
        </mat-list>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .mat-mdc-list-item {
        cursor: pointer;
        border-radius: 8px;
        transition: background-color 0.2s;
        &:hover {
          background-color: rgba(0, 0, 0, 0.04); // Material hover color
        }
      }
    `,
  ],
})
export class AccountComponent {
  user$ = this._store.select(UserSelectors.user);

  constructor(
    private _userApiService: UserApiService,
    private _dialog: DialogService,
    private _matDialog: MatDialog,
    private _titleService: Title,
    private _store: Store,
    private _authService: AuthService
  ) {
    this._titleService.setTitle('Your account');
  }

  onEditProfile(user: ReadUser) {
    this._matDialog.open<EditUserDialogComponent, EditUserDialogProps>(
      EditUserDialogComponent,
      DspDialogConfig.dialogDrawerConfig({ user }, true)
    );
  }

  onEditPassword(user: ReadUser) {
    this._matDialog
      .open<
        EditPasswordDialogComponent,
        EditPasswordDialogProps,
        boolean
      >(EditPasswordDialogComponent, DspDialogConfig.dialogDrawerConfig({ user }, true))
      .afterClosed()
      .subscribe();
  }
  onDeleteAccount() {}

  onDeleteOwnAccount(user: ReadUser) {
    this._dialog.afterConfirmation(`Do you want to suspend your own account?`).subscribe(() => {
      this._userApiService.delete(user.id).subscribe(() => {
        this._authService.logout();
      });
    });
  }
}
