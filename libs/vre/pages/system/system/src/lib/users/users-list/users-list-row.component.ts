import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Constants, ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';

@Component({
  selector: 'app-users-list-row',
  template: `<span style="display: flex">
    <app-user-description [user]="user" />
    <mat-chip-listbox *ngIf="isSystemAdmin(user.permissions)" style="padding: 0 16px">
      <mat-chip class="sys-admin-chip">System Admin</mat-chip>
    </mat-chip-listbox>

    <app-users-list-row-menu [user]="user" (refreshParent)="refreshParent.emit()" />
  </span>`,
  styles: [
    `
      :host {
        display: block;
        padding: 16px;

        &:hover {
          background: #d6e0e8;
        }
      }
    `,
  ],
})
export class UsersListRowComponent {
  @Input({ required: true }) user!: ReadUser;
  @Output() refreshParent = new EventEmitter<void>();

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
}
