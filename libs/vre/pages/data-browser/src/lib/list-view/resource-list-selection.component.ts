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
        <button mat-button *ngIf="showCreateLink$ | async" (click)="openCreateLinkDialog()">
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

  count$ = this.multipleViewerService.selectedResourceIds$.pipe(map(ids => ids.length));
  showCreateLink$ = this.count$.pipe(map(count => count > 1));

  allSelected$ = this.multipleViewerService.selectedResourceIds$.pipe(
    map(ids => this.resources.every(resource => ids.includes(resource.id)))
  );

  constructor(
    public multipleViewerService: MultipleViewerService,
    private _dialog: MatDialog,
    private _route: ActivatedRoute
  ) {}

  selectAll() {
    this.multipleViewerService.addResources(this.resources.map(resource => resource.id));
  }

  unselectAll() {
    this.multipleViewerService.removeResources(this.resources.map(resource => resource.id));
  }

  openCreateLinkDialog(): void {
    console.log(this._route);
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
