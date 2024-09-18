import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilteredResources } from '@dasch-swiss/vre/shared/app-common-to-move';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { ResourceLinkFormDialogComponent, ResourceLinkFormDialogProps } from '../resource-link-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-intermediate',
  templateUrl: './intermediate.component.html',
  styleUrls: ['./intermediate.component.scss'],
})
export class IntermediateComponent {
  @Input({ required: true }) resources!: FilteredResources;
  @Output() action = new EventEmitter<string>();

  itemPluralMapping = {
    resource: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '=1': 'Resource',
      other: 'Resources',
    },
  };

  constructor(
    private _dialog: MatDialog,
    private _notification: NotificationService
  ) {}

  openDialog() {
    const currentProjectIri = this.resources.resInfo.reduce(
      (acc, curr, index) => {
        if (index === 0) {
          return curr.attachedToProject;
        } else if (acc !== curr.attachedToProject) {
          return null;
        } else {
          return acc;
        }
      },
      null as null | string
    );

    if (currentProjectIri === null) {
      this._notification.openSnackBar(
        'The selected resources are attached to different projects. A link cannot be created.'
      );
      return;
    }

    this._dialog.open<ResourceLinkFormDialogComponent, ResourceLinkFormDialogProps>(ResourceLinkFormDialogComponent, {
      data: { resources: this.resources, projectIri: currentProjectIri },
    });
  }
}
