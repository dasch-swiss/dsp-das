import { ChangeDetectorRef, Component, Inject, Input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Constants, KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { DeleteResourceDialogComponent } from '@dasch-swiss/vre/resource-editor/properties-display';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { EraseResourceDialogComponent } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { Store } from '@ngxs/store';
import { combineLatest, map, of } from 'rxjs';

interface DeletionCheck {
  canDo: boolean;
  reason?: string;
}

@Component({
  selector: 'app-resource-toolbar',
  template: `
    <span class="action">
      <button
        mat-icon-button
        matTooltip="Open resource in new tab"
        color="primary"
        data-cy="open-in-new-window-button"
        matTooltipPosition="above"
        (click)="openResource()">
        <mat-icon>open_in_new</mat-icon>
      </button>
      <!-- Share resource: copy ark url, add to favorites or open in new tab -->
      <button
        color="primary"
        mat-icon-button
        data-cy="share-button"
        matTooltip="Share resource: {{ resource.versionArkUrl }}"
        matTooltipPosition="above"
        [matMenuTriggerFor]="share">
        <mat-icon>share</mat-icon>
      </button>

      <app-permission-info [resource]="resource" />
      <!-- more menu with: delete, erase resource -->
      <button
        data-cy="resource-toolbar-more-button"
        color="primary"
        *ngIf="userCanDelete$ | async"
        mat-icon-button
        matTooltip="More"
        matTooltipPosition="above"
        [matMenuTriggerFor]="more"
        (menuOpened)="checkResourceCanBeDeleted()">
        <mat-icon>more_vert</mat-icon>
      </button>
    </span>

    <mat-menu #share="matMenu">
      <button
        data-cy="resource-toolbar-delete-resource-button"
        mat-menu-item
        [matTooltip]="
          resourceCanBeDeleted?.canDo
            ? 'Move resource to trash bin.'
            : resourceCanBeDeleted?.reason || 'Checking if the resource can be deleted...'
        "
        matTooltipPosition="above"
        [disabled]="!resourceCanBeDeleted?.canDo"
        (click)="deleteResource()">
        <span style="display: inline-flex; align-items: center; gap: 8px;">
          <ng-container *ngIf="resourceCanBeDeleted === undefined; else icon">
            <mat-progress-spinner
              diameter="20"
              strokeWidth="2"
              mode="indeterminate"
              style="width: 20px; height: 20px;"></mat-progress-spinner>
          </ng-container>
          <ng-template #icon>
            <mat-icon>delete</mat-icon>
          </ng-template>
          {{ 'resourceEditor.resourceProperties.delete' | translate }}
        </span>
      </button>
    </mat-menu>

    <mat-menu #more="matMenu">
      <button
        data-cy="resource-toolbar-delete-resource-button"
        mat-menu-item
        style="display: flex; justify-content: space-between;"
        [matTooltip]="
          resourceCanBeDeleted?.canDo
            ? 'Move resource to trash bin.'
            : resourceCanBeDeleted?.reason || 'Checking if the resource can be deleted...'
        "
        matTooltipPosition="above"
        [disabled]="!resourceCanBeDeleted?.canDo"
        (click)="deleteResource()">
        <span style="display: inline-flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 32px; height: 24px;">
            <ng-container *ngIf="resourceCanBeDeleted === undefined; else icon">
              <mat-progress-spinner
                diameter="20"
                strokeWidth="2"
                mode="indeterminate"
                style="width: 24px; height: 24px;"></mat-progress-spinner>
            </ng-container>
            <ng-template #icon>
              <mat-icon>delete</mat-icon>
            </ng-template>
          </span>
          {{ 'resourceEditor.resourceProperties.delete' | translate }}
        </span>
      </button>
      <button
        *ngIf="isAdmin$ | async"
        data-cy="resource-toolbar-erase-resource-button"
        mat-menu-item
        [matTooltip]="
          resourceCanBeDeleted?.canDo
            ? 'Erase resource forever. This cannot be undone.'
            : resourceCanBeDeleted?.reason || 'Checking if resource can be deleted...'
        "
        matTooltipPosition="above"
        [disabled]="!resourceCanBeDeleted?.canDo"
        (click)="eraseResource()">
        <span style="display: inline-flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 32px; height: 24px;">
            <ng-container *ngIf="resourceCanBeDeleted === undefined; else icon">
              <mat-progress-spinner
                diameter="20"
                strokeWidth="2"
                mode="indeterminate"
                style="width: 24px; height: 24px;"></mat-progress-spinner>
            </ng-container>
            <ng-template #icon>
              <mat-icon>delete_forever</mat-icon>
            </ng-template>
          </span>
          Erase resource
        </span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      .action {
        display: inline-flex;

        button {
          border-radius: 0;
        }
      }
    `,
  ],
})
export class ResourceToolbarComponent {
  @Input({ required: true }) resource!: ReadResource;

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  userCanDelete$ = this._resourceFetcherService.userCanDelete$;

  resourceCanBeDeleted?: DeletionCheck;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApi: KnoraApiConnection,
    protected notification: NotificationService,
    private _resourceService: ResourceService,
    private _resourceFetcherService: ResourceFetcherService,
    private _dialog: MatDialog,
    private _store: Store,
    private _viewContainerRef: ViewContainerRef
  ) {}

  checkResourceCanBeDeleted() {
    if (this.resource.incomingReferences.length > 0) {
      this.resourceCanBeDeleted = {
        canDo: false,
        reason: 'This resource cannot be deleted as it has incoming references.',
      };
      return;
    }

    const noIncomingLinks$ = this._dspApi.v2.search
      .doSearchIncomingLinks(this.resource.id)
      .pipe(map(res => res.resources.length === 0));

    const noStillImageLinks$ = this._dspApi.v2.search
      .doSearchStillImageRepresentationsCount(this.resource.id)
      .pipe(map(res => res.numberOfResults === 0));

    const noRegions$ = this.resource.properties[Constants.HasStillImageFileValue]
      ? this._dspApi.v2.search.doSearchIncomingRegions(this.resource.id).pipe(map(seq => seq.resources.length === 0))
      : of(true);

    combineLatest([noIncomingLinks$, noStillImageLinks$, noRegions$]).subscribe(([noLinks, noStills, noRegions]) => {
      const canDelete = noLinks && noStills && noRegions;

      if (canDelete) {
        this.resourceCanBeDeleted = {
          canDo: true,
        };
      } else {
        const reasons = [];
        if (!noLinks) reasons.push('incoming links');
        if (!noStills) reasons.push('still image representations (pages) linked to it');
        if (!noRegions) reasons.push('regions annotating the still image representation');

        this.resourceCanBeDeleted = {
          canDo: false,
          reason: `This resource cannot be deleted as it has ${reasons.join(' and ')}.`,
        };
      }
    });
  }

  openResource() {
    window.open(`/resource${this._resourceService.getResourcePath(this.resource.id)}`, '_blank');
  }

  deleteResource() {
    this._dialog.open<DeleteResourceDialogComponent, ReadResource>(DeleteResourceDialogComponent, {
      data: this.resource,
      viewContainerRef: this._viewContainerRef,
    });
  }

  eraseResource() {
    this._dialog.open<EraseResourceDialogComponent, ReadResource>(EraseResourceDialogComponent, {
      data: this.resource,
      viewContainerRef: this._viewContainerRef,
    });
  }
}
