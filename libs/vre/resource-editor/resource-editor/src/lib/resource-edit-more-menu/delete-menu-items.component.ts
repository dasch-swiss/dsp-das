import { Component, EventEmitter, Inject, inject, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDoResponse, DeleteResource, KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { DeleteResourceDialogComponent } from '@dasch-swiss/vre/resource-editor/properties-display';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { EraseResourceDialogComponent } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { filterNull, UserPermissions } from '@dasch-swiss/vre/shared/app-common';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, filter, map, Observable } from 'rxjs';

@Component({
  selector: 'app-delete-menu-items',
  template: `
    <app-delete-button [resourceCanBeDeleted$]="resourceCanBeDeleted$" (delete)="deleteResource()" />

    <app-erase-button
      [resourceCanBeDeleted$]="resourceCanBeDeleted$"
      [showButton$]="userHasProjectAdminRights$"
      (erase)="eraseResource()" />
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
