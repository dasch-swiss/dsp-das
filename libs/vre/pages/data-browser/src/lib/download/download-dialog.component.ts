import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Constants, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';

export interface DownloadDialogData {
  resClass: ResourceClassDefinitionWithAllLanguages;
  resourceCount: number;
  properties: PropertyInfoValues[];
}

@Component({
  selector: 'app-download-dialog',
  template: `
    <app-dialog-header [title]="'Download'" [subtitle]="data.resourceCount + ' resources available'" />

    <div style="display: flex; justify-content: center">
      @if (isStillImageResource) {
        <app-double-chip-selector [options]="['Resources', 'Images']" [(value)]="isResourcesMode" />
      }
    </div>
    <div mat-dialog-content style="max-height: 100vh">
      @if (isStillImageResource && !isResourcesMode) {
        <app-download-dialog-images-tab />
      } @else {
        <app-download-dialog-properties-tab
          [properties]="data.properties"
          [resourceClassIri]="data.resClass.id"
          style="display: block; height: 100%" />
      }
    </div>
  `,
  styles: [``],
  standalone: false,
})
export class DownloadDialogComponent {
  isStillImageResource!: boolean;
  isResourcesMode = true;

  constructor(
    public dialogRef: MatDialogRef<DownloadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DownloadDialogData
  ) {
    this.isStillImageResource = this.data.resClass.propertiesList
      .map(v => v.propertyIndex)
      .includes(Constants.HasStillImageFileValue);
  }
}
