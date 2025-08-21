import { Component, Input, OnInit } from '@angular/core';
import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-project-members-row',
  template: `
    <div style="display: flex; align-items: center; gap: 16px; padding: 16px 0">
      <app-user-description [user]="user" style="flex: 1" />
    
      <mat-chip-listbox>
        @if (isProjectAdmin(user.permissions)) {
          <mat-chip class="admin-chip">Admin</mat-chip>
        }
      </mat-chip-listbox>
    
      @if (project) {
        <app-select-group [projectId]="project.id" [user]="user" />
      }
    
      @if (project) {
        <app-project-members-row-menu [user]="user" [project]="project" />
      }
    </div>
    `,
})
export class ProjectMembersRowComponent implements OnInit {
  @Input({ required: true }) user!: ReadUser;

  project?: ReadProject;

  constructor(private _store: Store) {}

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
