import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { RegionService, ResourceFetcherService, ResourceUtil } from '@dasch-swiss/vre/resource-editor/representations';
import {
  DeleteResourceDialogComponent,
  EditResourceLabelDialogComponent,
  EraseResourceDialogComponent,
} from '@dasch-swiss/vre/resource-editor/resource-properties';
import { DspResource, ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-resource-toolbar',
  template: `
    <span class="action" [class.deleted]="resource.res.isDeleted">
      <button
        mat-icon-button
        matTooltip="Open resource in new tab"
        color="primary"
        data-cy="open-in-new-window-button"
        matTooltipPosition="above"
        [disabled]="resource.res.isDeleted"
        (click)="openResource()">
        <mat-icon>open_in_new</mat-icon>
      </button>
      <!-- Share resource: copy ark url, add to favorites or open in new tab -->
      <button
        color="primary"
        mat-icon-button
        class="share-res"
        data-cy="share-button"
        matTooltip="Share resource: {{ resource.res.versionArkUrl }}"
        matTooltipPosition="above"
        [disabled]="resource.res.isDeleted"
        [matMenuTriggerFor]="share">
        <mat-icon>share</mat-icon>
      </button>

      <app-permission-info
        *ngIf="isAdmin$ | async"
        [hasPermissions]="resource.res.hasPermissions"
        [userHasPermission]="resource.res.userHasPermission" />
      <app-permission-info *ngIf="isAdmin$ | async" [userHasPermission]="resource.res.userHasPermission" />
      <!-- more menu with: delete, erase resource -->
      <button
        data-cy="resource-toolbar-more-button"
        color="primary"
        *ngIf="(userCanEdit && showEditLabel) || userCanDelete || (isAdmin$ | async)"
        mat-icon-button
        class="more-menu"
        matTooltip="More"
        matTooltipPosition="above"
        [matMenuTriggerFor]="more"
        [disabled]="resource.res.isDeleted">
        <mat-icon>more_vert</mat-icon>
      </button>
    </span>

    <mat-menu #share="matMenu" class="res-share-menu">
      <button
        mat-menu-item
        matTooltip="Copy ARK url"
        matTooltipPosition="above"
        data-cy="copy-ark-url-button"
        [cdkCopyToClipboard]="resource.res.versionArkUrl"
        (click)="this.notification.openSnackBar('ARK URL copied to clipboard!')">
        <mat-icon>content_copy</mat-icon>
        Copy ARK url to clipboard
      </button>
      <button
        mat-menu-item
        matTooltip="Copy internal link"
        data-cy="copy-internal-link-button"
        matTooltipPosition="above"
        [cdkCopyToClipboard]="resource.res.id"
        (click)="this.notification.openSnackBar('Internal link copied to clipboard!')">
        <mat-icon>content_copy</mat-icon>
        Copy internal link to clipboard
      </button>
    </mat-menu>

    <mat-menu #more="matMenu" class="res-more-menu">
      <button
        *ngIf="showEditLabel"
        [disabled]="!userCanEdit"
        data-cy="resource-toolbar-edit-resource-button"
        mat-menu-item
        matTooltip="Edit the label of this resource"
        matTooltipPosition="above"
        (click)="editResourceLabel()">
        <mat-icon>edit</mat-icon>
        Edit label
      </button>
      <button
        data-cy="resource-toolbar-delete-resource-button"
        [disabled]="!userCanDelete"
        mat-menu-item
        matTooltip="Move resource to trash bin."
        matTooltipPosition="above"
        (click)="deleteResource()">
        <mat-icon>delete</mat-icon>
        Delete resource
      </button>
      <button
        *ngIf="isAdmin$ | async"
        data-cy="resource-toolbar-erase-resource-button"
        mat-menu-item
        matTooltip="Erase resource forever. This cannot be undone."
        matTooltipPosition="above"
        (click)="eraseResource()">
        <mat-icon>delete_forever</mat-icon>
        Erase resource
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
  @Input({ required: true }) resource!: DspResource;
  @Input() showEditLabel = true;
  @Input() linkToNewTab?: string;

  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isAdmin$!: Observable<string[]>;

  get userCanEdit() {
    return ResourceUtil.userCanEdit(this.resource.res);
  }

  get userCanDelete() {
    return ResourceUtil.userCanDelete(this.resource.res);
  }

  constructor(
    protected notification: NotificationService,
    private _resourceService: ResourceService,
    private _cd: ChangeDetectorRef,
    private _dialog: MatDialog,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
    private _regionService: RegionService,
    private _resourceFetcher: ResourceFetcherService
  ) {}

  openResource() {
    const resourceSegments = this.linkToNewTab
      ? this.linkToNewTab
      : this._resourceService.getResourcePath(this.resource.res.id);
    window.open(`/resource${resourceSegments}`, '_blank');
  }

  editResourceLabel() {
    this._dialog
      .open<EditResourceLabelDialogComponent, ReadResource, boolean>(EditResourceLabelDialogComponent, {
        data: this.resource.res,
      })
      .afterClosed()
      .pipe(filter(answer => !!answer))
      .subscribe(answer => {
        this._resourceFetcher.reload();
        this._cd.markForCheck();
      });
  }

  deleteResource() {
    this._dialog
      .open<DeleteResourceDialogComponent, ReadResource>(DeleteResourceDialogComponent, { data: this.resource.res })
      .afterClosed()
      .pipe(filter(response => !!response))
      .subscribe(() => {
        this._afterResourceDeleted();
      });
  }

  eraseResource() {
    this._dialog
      .open<EraseResourceDialogComponent, ReadResource>(EraseResourceDialogComponent, { data: this.resource.res })
      .afterClosed()
      .pipe(filter(response => !!response))
      .subscribe(() => {
        this._afterResourceDeleted();
      });
  }

  private _afterResourceDeleted() {
    const className = this.resource.res.type.split('#')[1];

    if (className === 'Region') {
      this._regionService.updateRegions$().pipe(take(1)).subscribe();
      return;
    }

    const pId = this._store.selectSnapshot(ProjectsSelectors.currentProject)!.id;
    const pUuid = ProjectService.IriToUuid(pId);

    const ontologyName = this._route.snapshot?.paramMap.get(RouteConstants.ontoParameter);

    if (!pId || !ontologyName) {
      this._router.navigate([RouteConstants.home]);
    } else {
      this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this._router.navigate([RouteConstants.project, pUuid, RouteConstants.ontology, ontologyName, className]);
      });
    }
  }
}
