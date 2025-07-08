import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Constants, ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';

@Component({
  selector: 'app-users-list-row',
  template: ` <td>
      <img appAdminImage [image]="user.email" [type]="'user'" alt="avatar" />
    </td>

    <td>
      <h5>{{ user.givenName }} {{ user.familyName }}</h5>
      <p class="mat-subtitle-2">
        <span>{{ user.username }} </span>
        <span>| {{ user.email }}</span>
      </p>
    </td>

    <td class="table-admin-chip">
      <mat-chip-listbox *ngIf="isSystemAdmin(user.permissions)">
        <mat-chip class="sys-admin-chip">System Admin</mat-chip>
      </mat-chip-listbox>
    </td>

    <td class="table-action">
      <app-users-list-row-menu [user]="user" (refreshParent)="refreshParent.emit()" />
    </td>`,
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
