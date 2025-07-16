import { Component, Input, OnInit } from '@angular/core';
import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { Group } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-project-members-row',
  template: `
    <div style="display: flex; align-items: center; gap: 16px; padding: 16px 0">
      <app-user-description [user]="user" style="flex: 1" />

      <mat-chip-listbox>
        <mat-chip class="admin-chip" *ngIf="isProjectAdmin(user.permissions)">Admin</mat-chip>
      </mat-chip-listbox>

      <app-select-group *ngIf="project && groups" [projectId]="project.id" [user]="user" [groups]="groups" />

      <app-project-members-row-menu [user]="user" *ngIf="project" [project]="project" />
    </div>
  `,
})
export class ProjectMembersRowComponent implements OnInit {
  @Input({ required: true }) user!: ReadUser;
  @Input({ required: true }) groups!: Group[];

  project?: ReadProject;

  constructor(
    private _store: Store,
    private _userApiService: UserApiService
  ) {}

  ngOnInit() {
    this._store.select(ProjectsSelectors.currentProject).subscribe(project => {
      this.project = project;
    });
  }

  isProjectAdmin(permissions: PermissionsData): boolean {
    if (!permissions.groupsPerProject) {
      return false;
    }

    return ProjectService.IsMemberOfProjectAdminGroup(permissions.groupsPerProject, this.project?.id || '');
  }
}
