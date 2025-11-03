import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DownloadProperty } from './download-property-list.component';

export interface DownloadDialogData {
  properties: DownloadProperty[];
  resourceCount: number;
}

@Component({
  selector: 'app-download-dialog',
  template: `
    <app-dialog-header [title]="'Download'" [subtitle]="data.resourceCount + ' resources available'" />

    <div style="display: flex; justify-content: center">
      <app-double-chip-selector [options]="['Resources', 'Images']" [(value)]="isResourcesMode" />
    </div>
    <div mat-dialog-content>
      <app-download-dialog-properties-tab [properties]="properties" />
    </div>
  `,
  styles: [``],
  standalone: false,
})
export class DownloadDialogComponent {
  isResourcesMode = true;
  properties: DownloadProperty[] = [];

  constructor(
    public dialogRef: MatDialogRef<DownloadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DownloadDialogData
  ) {
    this.properties = [...data.properties];
  }
}
