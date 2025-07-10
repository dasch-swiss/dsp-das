import { Component, Input } from '@angular/core';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';

@Component({
  selector: 'app-project-members-row',
  template: `
    <div style="display: flex">
      <app-user-description [user]="user" />

      <mat-chip-listbox>
        <mat-chip class="admin-chip" *ngIf="isProjectAdmin(user.permissions)">Admin</mat-chip>
      </mat-chip-listbox>

      <app-select-group
        *ngIf="(isProjectOrSystemAdmin$ | async) === true"
        [projectCode]="(project$ | async)?.shortcode"
        [projectid]="(project$ | async)?.id"
        [permissions]="user.permissions.groupsPerProject[(project$ | async)?.id]"
        [disabled]="!status"
        (groupChange)="updateGroupsMembership(user.id, $event)" />

      <app-project-members-row-menu [user]="user" />
    </div>
  `,
})
export class ProjectMembersRowComponent {
  @Input({ required: true }) user!: ReadUser;

  isProjectAdmin(permissions: PermissionsData): boolean {
    if (!permissions.groupsPerProject) {
      return false;
    }

    return ProjectService.IsMemberOfProjectAdminGroup(permissions.groupsPerProject, this.project?.id || '');
  }
}
