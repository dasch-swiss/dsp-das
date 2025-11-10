import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Constants,
  KnoraApiConnection,
  PropertyDefinition,
  ResourceClassDefinitionWithAllLanguages,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { map, Observable } from 'rxjs';

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
        <app-download-dialog-images-tab />
      } @else {
        @if (properties$ | async; as properties) {
          <app-download-dialog-properties-tab [properties]="properties" [resourceClassIri]="data.resClass.id" />
        }
      }
    </div>
  `,
  styles: [``],
  standalone: false,
})
export class DownloadDialogComponent {
  isStillImageResource!: boolean;
  isResourcesMode = true;

  properties$!: Observable<PropertyDefinition[]>;

  constructor(
    public dialogRef: MatDialogRef<DownloadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DownloadDialogData,
    @Inject(DspApiConnectionToken)
    private readonly _dspApiConnection: KnoraApiConnection
  ) {
    this.isStillImageResource = this.data.resClass.propertiesList
      .map(v => v.propertyIndex)
      .includes(Constants.HasStillImageFileValue);

    console.log(this.data.resClass, 'TODO FIX filtering resource classes');
    const blockList = [Constants.HasStandoffLinkToValue, Constants.HasIncomingLinkValue];
    this.properties$ = this._dspApiConnection.v2.ontologyCache
      .getResourceClassDefinition(this.data.resClass.id)
      .pipe(
        map(v =>
          v
            .getAllPropertyDefinitions()
            .filter(y => y instanceof ResourcePropertyDefinition && !blockList.includes(y.id))
        )
      );
  }
}
