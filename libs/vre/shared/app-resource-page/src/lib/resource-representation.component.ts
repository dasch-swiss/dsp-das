import { Component, Input, OnChanges } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { FileRepresentation, RepresentationConstants, getFileValue } from '@dasch-swiss/vre/shared/app-representations';

@Component({
  selector: 'app-resource-representation',
  template: ` <div class="representation-container center" [ngSwitch]="representationToDisplay.fileValue.type">
    <app-still-image
      #stillImage
      class="dsp-representation stillimage"
      *ngSwitchCase="representationConstants.stillImage"
      [resource]="resource.res" />

    <app-still-image
      #stillImage
      class="dsp-representation stillimage"
      *ngSwitchCase="representationConstants.externalStillImage"
      [resource]="resource.res" />

    <app-document
      #document
      class="dsp-representation document"
      [class.pdf]="representationToDisplay.fileValue.filename.split('.').pop() === 'pdf'"
      *ngSwitchCase="representationConstants.document"
      [src]="representationToDisplay"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-document>

    <app-audio
      #audio
      class="dsp-representation audio"
      *ngSwitchCase="representationConstants.audio"
      [src]="representationToDisplay"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-audio>

    <app-video
      #video
      class="dsp-representation video"
      *ngSwitchCase="representationConstants.movingImage"
      [src]="representationToDisplay"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-video>

    <app-archive
      #archive
      class="dsp-representation archive"
      *ngSwitchCase="representationConstants.archive"
      [src]="representationToDisplay"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-archive>

    <app-text
      #text
      class="dsp-representation text"
      *ngSwitchCase="representationConstants.text"
      [src]="representationToDisplay"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-text>
  </div>`,
})
export class ResourceRepresentationComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;
  representationToDisplay!: FileRepresentation;

  loading = false;
  protected readonly representationConstants = RepresentationConstants;

  ngOnChanges() {
    this.representationToDisplay = new FileRepresentation(getFileValue(this.resource)!);
  }

  representationLoaded(e: boolean) {
    this.loading = !e;
  }
}
