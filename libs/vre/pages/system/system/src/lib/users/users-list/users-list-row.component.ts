import { Component, Input } from '@angular/core';
import { Constants, ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';

@Component({
  selector: 'app-users-list-row',
  template: ` <!-- avatar -->
    <td class="avatar-cell">
      <img appAdminImage [image]="user.email" [type]="'user'" alt="avatar" class="avatar-image" />
    </td>

    <!-- name and e-mail address -->
    <td class="table-info">
      <h5 class="mat-subtitle-1 info-names">
        <!-- Names hidden on phone devices -->
        {{ user.givenName }} {{ user.familyName }}
      </h5>
      <p class="mat-subtitle-2">
        <span class="info-username">{{ user.username }} </span>
        <!-- Email hidden on phone devices -->
        <span class="info-email">| {{ user.email }}</span>
        <!-- TODO: question: how public should the email address be? -->
      </p>
    </td>

    <td class="table-admin-chip">
      <mat-chip-listbox *ngIf="isSystemAdmin(user.permissions)">
        <mat-chip class="sys-admin-chip">System Admin</mat-chip>
      </mat-chip-listbox>
    </td>
    <td class="table-action">
      <app-users-list-row-menu [user]="user" />
    </td>`,
})
export class UsersListRowComponent {
  @Input({ required: true }) user!: ReadUser;

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
