import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export class ResourceFetcherDialogProps {
  resourceIri: string;
  index: number;
}

@Component({
  selector: 'app-resource-fetcher-dialog',
  template: `
    <div style="padding: 16px">
      <div>
        <button mat-icon-button (click)="_dialogRef.close()"><mat-icon>close</mat-icon></button>
      </div>
      <app-resource-fetcher [resourceIri]="data.resourceIri" />
    </div>
  `,
  standalone: false,
})
export class ResourceFetcherDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ResourceFetcherDialogProps,
    public _dialogRef: MatDialogRef<any>
  ) {}
}
