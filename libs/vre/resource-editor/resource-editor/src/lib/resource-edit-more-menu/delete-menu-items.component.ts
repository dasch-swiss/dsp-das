import { Component, EventEmitter, Inject, inject, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDoResponse, DeleteResource, KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { DeleteResourceDialogComponent } from '@dasch-swiss/vre/resource-editor/properties-display';
import { ResourceFetcherService, ResourceUtil } from '@dasch-swiss/vre/resource-editor/representations';
import { EraseResourceDialogComponent } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { filterNull, UserPermissions } from '@dasch-swiss/vre/shared/app-common';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, filter, map, Observable } from 'rxjs';

@Component({
  selector: 'app-delete-menu-items',
  template: `
    @if (resourceCanBeDeleted$ | async; as resourceCanBeDeleted) {
      <button
        data-cy="resource-more-menu-delete-button"
        mat-menu-item
        [matTooltip]="
          resourceCanBeDeleted.canDo
            ? ('resourceEditor.moreMenu.moveToTrash' | translate)
            : resourceCanBeDeleted.cannotDoReason || ('resourceEditor.moreMenu.checkingPermission' | translate)
        "
        matTooltipPosition="above"
        [disabled]="!resourceCanBeDeleted.canDo"
        (click)="deleteResource()">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 32px; height: 24px;">
            <mat-icon>delete</mat-icon>
          </span>
          {{ 'ui.common.actions.delete' | translate }}
        </div>
      </button>

      @if (userHasProjectAdminRights$ | async) {
        <button
          data-cy="resource-more-menu-erase-button"
          mat-menu-item
          [matTooltip]="
            resourceCanBeDeleted.canDo
              ? ('resourceEditor.moreMenu.eraseResourceTooltip' | translate)
              : resourceCanBeDeleted.cannotDoReason || ('resourceEditor.moreMenu.checkingPermissionErase' | translate)
          "
          matTooltipPosition="above"
          [disabled]="!resourceCanBeDeleted.canDo"
          (click)="eraseResource()">
          <span style="display: inline-flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 32px; height: 24px;">
              <mat-icon>delete_forever</mat-icon>
            </span>
            {{ 'resourceEditor.moreMenu.eraseResource' | translate }}
          </span>
        </button>
      }
    } @else {
      <button
        data-cy="resource-more-menu-delete-button"
        mat-menu-item
        [matTooltip]="'resourceEditor.moreMenu.checkingPermission' | translate"
        matTooltipPosition="above"
        disabled>
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 32px; height: 24px;">
            <app-progress-spinner />
          </span>
          {{ 'ui.common.actions.delete' | translate }}
        </div>
      </button>

      <button
        data-cy="resource-more-menu-erase-button"
        mat-menu-item
        [matTooltip]="'resourceEditor.moreMenu.checkingPermissionErase' | translate"
        matTooltipPosition="above"
        disabled>
        <span style="display: inline-flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 32px; height: 24px;">
            <app-progress-spinner />
          </span>
          {{ 'resourceEditor.moreMenu.eraseResource' | translate }}
        </span>
      </button>
    }
  `,
  standalone: false,
})
export class DeleteMenuItemsComponent implements OnInit {
  @Input({ required: true }) resource!: ReadResource;
  @Output() resourceDeleted = new EventEmitter<void>();
  @Output() resourceErased = new EventEmitter<void>();

  resourceCanBeDeleted$!: Observable<CanDoResponse>;

  readonly userHasProjectAdminRights$ = combineLatest([
    this._userService.user$.pipe(filterNull()),
    this.resourceFetcher.projectIri$,
  ]).pipe(map(([user, projectIri]) => UserPermissions.hasProjectAdminRights(user, projectIri)));

  private readonly _translateService = inject(TranslateService);

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _dialog: MatDialog,
    public resourceFetcher: ResourceFetcherService,
    private _userService: UserService,
    private _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    this.resourceCanBeDeleted$ = this._canDeleteResource$(this.resource);
  }

  userCanDelete() {
    return ResourceUtil.userCanDelete(this.resource);
  }

  _canDeleteResource$(resource: ReadResource): Observable<CanDoResponse> {
    const resourceToCheck = new DeleteResource();
    resourceToCheck.id = resource.id;
    resourceToCheck.type = resource.type;
    resourceToCheck.lastModificationDate = resource.lastModificationDate;
    return this._dspApiConnection.v2.res
      .canDeleteResource(resourceToCheck)
      .pipe(filter(res => res instanceof CanDoResponse));
  }

  deleteResource() {
    this._dialog
      .open<DeleteResourceDialogComponent, ReadResource, boolean>(DeleteResourceDialogComponent, {
        data: this.resource,
        viewContainerRef: this._viewContainerRef,
      })
      .afterClosed()
      .subscribe(response => {
        if (response) {
          this.resourceDeleted.emit();
        }
      });
  }

  eraseResource() {
    this._dialog
      .open<EraseResourceDialogComponent, ReadResource, boolean>(EraseResourceDialogComponent, {
        data: this.resource,
        viewContainerRef: this._viewContainerRef,
      })
      .afterClosed()
      .subscribe(response => {
        if (response) {
          this.resourceErased.emit();
        }
      });
  }
}
