import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { UserService } from '@dasch-swiss/vre/core/session';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
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
  count$ = this.multipleViewerService.selectedResources$.pipe(map(resources => resources.length));
  showCreateLink$ = this.count$.pipe(map(count => count > 1));

  isCreateLinkButtonDisabled$ = combineLatest([
    this.multipleViewerService.selectedResources$,
    this._userService.user$,
  ]).pipe(
    map(([resources, user]) => {
      if (resources.length === 0) {
        return { disabled: true, reason: 'No resources selected' };
      }

      const projectUuid = resources[0].attachedToProject;
      const allSameProject = resources.every(resource => resource.attachedToProject === projectUuid);

      if (!allSameProject) {
        return { disabled: true, reason: 'Resources must be from the same project' };
      }

      if (!user) {
        return { disabled: true, reason: 'User not authenticated' };
      }

      const hasProjectMemberRights = ProjectService.HasProjectMemberRights(user, projectUuid);
      if (!hasProjectMemberRights) {
        return { disabled: true, reason: 'You do not have project member rights' };
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
