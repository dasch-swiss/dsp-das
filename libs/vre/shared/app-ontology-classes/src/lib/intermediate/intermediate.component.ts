import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilteredResources } from '@dasch-swiss/vre/shared/app-common-to-move';
import { ResourceLinkFormDialogComponent, ResourceLinkFormDialogProps } from '../resource-link-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-intermediate',
  templateUrl: './intermediate.component.html',
  styleUrls: ['./intermediate.component.scss'],
})
export class IntermediateComponent {
  @Input({ required: true }) resources!: FilteredResources;
  @Input({ required: true }) projectIri!: string;
  @Output() action = new EventEmitter<string>();

  itemPluralMapping = {
    resource: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '=1': 'Resource',
      other: 'Resources',
    },
  };

  constructor(private _dialog: MatDialog) {}

  openDialog() {
    this._dialog.open<ResourceLinkFormDialogComponent, ResourceLinkFormDialogProps>(ResourceLinkFormDialogComponent, {
      data: { resources: this.resources, projectIri: this.projectIri },
    });
  }
}
