import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { combineLatest, map } from 'rxjs';
import { MultipleViewerService } from '../comparison/multiple-viewer.service';
import { ResourceLinkDialogComponent, ResourceLinkDialogProps } from './resource-link-dialog.component';

@Component({
  selector: 'app-resource-list-selection',
  template: `
    <div style="background: #ebebeb; padding: 16px; display: flex; justify-content: space-between">
      <div style="display: flex; justify-content: space-between; flex: 1; align-items: center">
        <div>
          <div>{{ count$ | async }} resources selected</div>
          <button
            mat-button
            *ngIf="(showCreateLink$ | async) && (multipleViewerService.selectedResources$ | async) as selectedResources"
            (click)="openCreateLinkDialog(selectedResources)">
            <mat-icon>link</mat-icon>
            Create a link object
          </button>
        </div>

        <button mat-button *ngIf="allSelected$ | async; else selectAllTpl" (click)="unselectAll()">Unselect all</button>
      </div>
      <button mat-icon-button (click)="reset()"><mat-icon>close</mat-icon></button>
    </div>

    <ng-template #selectAllTpl>
      <button mat-button (click)="selectAll()">Select all</button>
    </ng-template>
  `,
})
export class ResourceListSelectionComponent {
  @Input({ required: true }) resources!: ReadResource[];

  count$ = this.multipleViewerService.selectedResources$.pipe(map(resources => resources.length));
  showCreateLink$ = combineLatest([this.count$, this.multipleViewerService.hasRightsToShowCreateLinkObject$]).pipe(
    map(([count, hasProjectMemberRights]) => count > 1 && hasProjectMemberRights)
  );

  allSelected$ = this.multipleViewerService.selectedResources$.pipe(
    map(resources => this.resources.every(resource => resources.includes(resource)))
  );

  constructor(
    public multipleViewerService: MultipleViewerService,
    private _dialog: MatDialog
  ) {}

  selectAll() {
    this.multipleViewerService.addResources(this.resources);
  }

  unselectAll() {
    this.multipleViewerService.removeResources(this.resources);
  }

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
