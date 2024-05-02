import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  DeleteResourceResponse,
  KnoraApiConnection,
  PermissionUtil,
  ReadLinkValue,
  ReadProject,
  ReadValue,
} from '@dasch-swiss/dsp-js';
import { AdminProjectsApiService } from '@dasch-swiss/vre/open-api';
import { DspResource, ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import {
  ComponentCommunicationEventService,
  EmitEvent,
  Events as CommsEvents,
  OntologyService,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import {
  DeleteResourceDialogComponent,
  DeleteResourceDialogProps,
  EditResourceLabelDialogComponent,
  EditResourceLabelDialogProps,
  EraseResourceDialogComponent,
  EraseResourceDialogProps,
} from '@dasch-swiss/vre/shared/app-resource-properties';
import { LoadClassItemsCountAction } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { filter } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource-toolbar',
  templateUrl: './resource-toolbar.html',
  styleUrls: ['./resource-toolbar.scss'],
})
export class ResourceToolbarComponent implements OnInit {
  @Input({ required: true }) resource!: DspResource;
  @Input() adminPermissions = false;
  /**
   * in case properties belongs to an annotation (e.g. region in still images)
   * in this case we don't have to display the isRegionOf property
   */
  @Input() isAnnotation = false;

  @Input() showToggleProperties = false;
  @Input() showEditLabel = true;

  @Input() attachedProject: ReadProject;

  @Input() lastModificationDate: string;

  @Output() regionChanged: EventEmitter<ReadValue> = new EventEmitter<ReadValue>();
  @Output() regionDeleted: EventEmitter<void> = new EventEmitter<void>();

  userCanDelete: boolean;
  userCanEdit: boolean;
  canReadComments: boolean;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _notification: NotificationService,
    private _resourceService: ResourceService,
    private _cd: ChangeDetectorRef,
    private _componentCommsService: ComponentCommunicationEventService,
    private _ontologyService: OntologyService,
    private _dialog: MatDialog,
    private _adminProjectsApi: AdminProjectsApiService,
    private _store: Store
  ) {}

  ngOnInit(): void {
    if (this.resource.res) {
      // get user permissions
      const allPermissions = PermissionUtil.allUserPermissions(
        this.resource.res.userHasPermission as 'RV' | 'V' | 'M' | 'D' | 'CR'
      );

      this.canReadComments = true; // allPermissions.indexOf(PermissionUtil.Permissions.RV) === -1; // TODO permissions to show comments should be provided
      // if user has modify permissions, set addButtonIsVisible to true so the user see's the add button
      this.userCanEdit = allPermissions.indexOf(PermissionUtil.Permissions.M) !== -1;
      this.userCanDelete = allPermissions.indexOf(PermissionUtil.Permissions.D) !== -1;
    }
    if (!this.attachedProject && this.resource.res.attachedToProject) {
      this._adminProjectsApi.getAdminProjectsIriProjectiri(this.resource.res.attachedToProject).subscribe(res => {
        this.attachedProject = res.project as ReadProject;
      });
    }
    this._cd.detectChanges();
  }

  openResource(linkValue: ReadLinkValue | string) {
    const iri = typeof linkValue == 'string' ? linkValue : linkValue.linkedResourceIri;
    const path = this._resourceService.getResourcePath(iri);
    window.open(`/resource${path}`, '_blank');
  }

  editResourceLabel() {
    this._dialog
      .open<EditResourceLabelDialogComponent, EditResourceLabelDialogProps, boolean>(EditResourceLabelDialogComponent)
      .afterClosed()
      .pipe(filter(answer => !!answer))
      .subscribe(answer => {
        this._componentCommsService.emit(new EmitEvent(CommsEvents.resourceChanged));
        if (this.isAnnotation) {
          this.regionChanged.emit();
        }
        this._cd.markForCheck();
      });
  }

  deleteResource() {
    this._dialog
      .open<DeleteResourceDialogComponent, DeleteResourceDialogProps>(DeleteResourceDialogComponent, {
        data: {
          resource: this.resource,
          lastModificationDate: this.lastModificationDate,
        },
      })
      .afterClosed()
      .pipe(filter(response => !!response))
      .subscribe(response => {
        this._onResourceDeleted(response);
      });
  }

  eraseResource() {
    this._dialog
      .open<EraseResourceDialogComponent, EraseResourceDialogProps>(EraseResourceDialogComponent, {
        data: {
          resource: this.resource,
          lastModificationDate: this.lastModificationDate,
        },
      })
      .afterClosed()
      .pipe(filter(response => !!response))
      .subscribe(response => {
        this._onResourceDeleted(response);
      });
  }

  openSnackBar(message: string) {
    this._notification.openSnackBar(message);
  }

  private _onResourceDeleted(response: DeleteResourceResponse) {
    // display notification and mark resource as 'erased'
    this._notification.openSnackBar(`${response.result}: ${this.resource.res.label}`);
    const ontologyIri = this._ontologyService.getOntologyIriFromRoute(this.attachedProject.shortcode);
    const classId = this.resource.res.entityInfo.classes[this.resource.res.type]?.id;
    this._store.dispatch(new LoadClassItemsCountAction(ontologyIri, classId));
    this._componentCommsService.emit(new EmitEvent(CommsEvents.resourceDeleted));
    // if it is an Annotation/Region which has been erases, we emit the
    // regionChanged event, in order to refresh the page
    this.regionDeleted.emit();

    this._cd.markForCheck();
  }
}
