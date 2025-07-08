import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Constants, ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';

@Component({
  selector: 'app-users-list-row',
  template: ` <span style="display: flex; ">
    <span style="flex: 1; display: flex; align-items: center">
      <span style="width: 50px; margin-right: 16px">
        <img appAdminImage [image]="user.email" [type]="'user'" alt="avatar" style="width: 50px;border-radius: 50px;" />
      </span>

      <span>
        <h5 class="mat-subtitle-1" style="margin-bottom: 0">{{ user.givenName }} {{ user.familyName }}</h5>
        <span class="mat-subtitle-2">{{ user.username }} | {{ user.email }}</span>
      </span>
    </span>

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
