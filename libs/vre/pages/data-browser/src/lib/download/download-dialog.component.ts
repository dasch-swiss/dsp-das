import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Constants, KnoraApiConnection, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { DownloadProperty } from './download-property-list.component';

export interface DownloadDialogData {
  resClass: ResourceClassDefinitionWithAllLanguages;
  resourceCount: number;
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
    <div mat-dialog-content>
      @if (isStillImageResource && !isResourcesMode) {
        IMAGE TAB
      } @else {
        <app-download-dialog-properties-tab [properties]="properties" />
      }
    </div>
  `,
  styles: [``],
  standalone: false,
})
export class DownloadDialogComponent {
  isStillImageResource!: boolean;
  isResourcesMode = true;

  properties: DownloadProperty[] = [];

  constructor(
    public dialogRef: MatDialogRef<DownloadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DownloadDialogData,
    @Inject(DspApiConnectionToken)
    private readonly _dspApiConnection: KnoraApiConnection
  ) {
    this.isStillImageResource = this.data.resClass.propertiesList
      .map(v => v.propertyIndex)
      .includes(Constants.HasStillImageFileValue);

    console.log(this.data.resClass);
    // this.properties = this.data.resClass.propertiesList;
  }
}
