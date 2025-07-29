import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { map } from 'rxjs';
import { MultipleViewerService } from '../multiple-viewer.service';
import {
  ResourceLinkDialogComponent,
  ResourceLinkDialogProps,
} from '../resource-link-dialog/resource-link-dialog.component';

@Component({
  selector: 'app-resource-list-selection',
  template: `
    <div style="background: #ebebeb; padding: 16px; display: flex; justify-content: space-between">
      <div>
        <div>{{ count$ | async }} resources selected</div>
        <button
          mat-button
          *ngIf="(showCreateLink$ | async) && (multipleViewerService.selectedResources$ | async) as selectedResourceIds"
          (click)="openCreateLinkDialog(selectedResourceIds)">
          <mat-icon>link</mat-icon>
          Create a link
        </button>
      </div>
      <button mat-button *ngIf="allSelected$ | async; else selectAllTpl" (click)="unselectAll()">Unselect all</button>
    </div>

    <ng-template #selectAllTpl>
      <button mat-button (click)="selectAll()">Select all</button>
    </ng-template>
  `,
})
export class ResourceListSelectionComponent {
  @Input({ required: true }) resources!: ReadResource[];

  count$ = this.multipleViewerService.selectedResources$.pipe(map(resources => resources.length));
  showCreateLink$ = this.count$.pipe(map(count => count > 1));

  allSelected$ = this.multipleViewerService.selectedResources$.pipe(
    map(resources => this.resources.every(resource => resources.includes(resource)))
  );

  constructor(
    public multipleViewerService: MultipleViewerService,
    private _dialog: MatDialog,
    private _route: ActivatedRoute
  ) {}

  selectAll() {
    this.multipleViewerService.addResources(this.resources);
  }

  unselectAll() {
    this.multipleViewerService.removeResources(this.resources);
  }

  openCreateLinkDialog(selectedResourceIds: string[]): void {
    const projectUuid =
      this._route.parent?.snapshot.params[RouteConstants.uuidParameter] ??
      this._route.snapshot.params[RouteConstants.project];

    this._dialog.open<ResourceLinkDialogComponent, ResourceLinkDialogProps>(ResourceLinkDialogComponent, {
      data: {
        resources: this.resources,
        projectUuid,
      },
    });
  }

  protected readonly open = open;
}
