import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FilteredResources } from '@dasch-swiss/vre/shared/app-common-to-move';

export interface ResourceLinkFormDialogProps {
  resources: FilteredResources;
}

@Component({
  selector: 'app-resource-link-form-dialog',
  template: ` <app-dialog-header
      [title]="'Create a collection of ' + data.resources.count + 'resources'"
      [subtitle]="'Link resources'" />
    <mat-dialog-content>
      <app-resource-link-form [resources]="data.resources" [project]="'test'" (closeDialog)="dialogRef.close($event)" />
    </mat-dialog-content>`,
})
export class ResourceLinkFormDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ResourceLinkFormDialogProps,
    public dialogRef: MatDialogRef<ResourceLinkFormDialogComponent, boolean>
  ) {}
}
