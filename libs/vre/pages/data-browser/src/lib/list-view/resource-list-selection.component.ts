import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { UserService } from '@dasch-swiss/vre/core/session';
import { UserPermissions } from '@dasch-swiss/vre/shared/app-common';
import { combineLatest, map } from 'rxjs';
import { MultipleViewerService } from '../comparison/multiple-viewer.service';
import { ResourceLinkDialogComponent, ResourceLinkDialogProps } from './resource-link-dialog.component';

@Component({
  selector: 'app-resource-list-selection',
  template: `
    <div style="background: #336790; color: white; padding: 0 16px; display: flex; gap: 8px; align-items: center">
      <div style="flex: 1; display: flex; align-items: center; gap: 16px;">
        <div>
          {{ 'pages.dataBrowser.resourceListSelection.resourcesSelected' | translate: { count: count$ | async } }}
        </div>
        @if ((showCreateLink$ | async) && (multipleViewerService.selectedResources$ | async); as selectedResources) {
          <div
            style="display: inline-block"
            [matTooltip]="
              (isCreateLinkButtonDisabled$ | async)?.reason ||
              ('pages.dataBrowser.resourceListSelection.createLinkObjectTooltip' | translate)
            "
            [matTooltipDisabled]="!(isCreateLinkButtonDisabled$ | async)?.disabled">
            <button
              mat-flat-button
              (click)="openCreateLinkDialog(selectedResources)"
              [disabled]="(isCreateLinkButtonDisabled$ | async)?.disabled">
              {{ 'pages.dataBrowser.resourceListSelection.createLinkObject' | translate }}
            </button>
          </div>
        }
      </div>
      <button mat-icon-button (click)="reset()"><mat-icon>close</mat-icon></button>
    </div>
  `,
  styles: ['button[disabled] { background-color: #fff; color: #b8b8b8 }'],
  standalone: false,
})
export class ResourceListSelectionComponent {
  showCreateLink$ = combineLatest([
    this.multipleViewerService.selectedResources$,
    this._userService.user$,
    this._userService.isSysAdmin$,
  ]).pipe(
    map(([resources, user, isSysAdmin]) => {
      // Must have more than 1 resource selected
      if (resources.length <= 1) return false;

      // Must have user
      if (!user) return false;

      // System Admin can always see the button
      if (isSysAdmin) return true;

      // Get unique project UUIDs from all selected resources
      const projectUuids = [...new Set(resources.map(r => r.attachedToProject))];

      // Check if user has Project Member OR Project Admin rights on ANY of the projects
      return projectUuids.some(projectUuid => UserPermissions.hasProjectMemberRights(user, projectUuid));
    })
  );

  isCreateLinkButtonDisabled$ = this.multipleViewerService.selectedResources$.pipe(
    map(resources => {
      if (resources.length === 0) {
        return { disabled: true, reason: 'No resources selected' };
      }

      const projectUuid = resources[0].attachedToProject;
      const allSameProject = resources.every(resource => resource.attachedToProject === projectUuid);

      if (!allSameProject) {
        return { disabled: true, reason: 'Resources must be from the same project' };
      }

      return { disabled: false };
    })
  );

  constructor(
    public multipleViewerService: MultipleViewerService,
    private readonly _userService: UserService,
    private readonly _dialog: MatDialog
  ) {}

  reset() {
    this.multipleViewerService.reset();
  }

  openCreateLinkDialog(resources: ReadResource[]): void {
    const projectUuid = resources[0].attachedToProject;
    this._dialog.open<ResourceLinkDialogComponent, ResourceLinkDialogProps>(ResourceLinkDialogComponent, {
      data: {
        resources,
        projectUuid,
      },
    });
  }
}
