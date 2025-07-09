import { Component, Input } from '@angular/core';
import { ReadUser } from '@dasch-swiss/dsp-js';

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
}
