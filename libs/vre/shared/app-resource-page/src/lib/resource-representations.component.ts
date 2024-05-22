import { Component, Input } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { FileRepresentation, RepresentationConstants } from '@dasch-swiss/vre/shared/app-representations';

@Component({
  selector: 'app-resource-representations',
  template: ` <div
    class="representation-container center"
    *ngIf="representationsToDisplay?.length && representationsToDisplay[0].fileValue"
    [ngSwitch]="representationsToDisplay[0].fileValue?.type">
    <!-- still image view -->
    <app-still-image
      #stillImage
      class="dsp-representation stillimage"
      *ngSwitchCase="representationConstants.stillImage"
      [parentResource]="resource.res"
      [image]="representationsToDisplay[0]">
    </app-still-image>

    <app-document
      #document
      class="dsp-representation document"
      [class.pdf]="representationsToDisplay[0].fileValue.filename.split('.').pop() === 'pdf'"
      *ngSwitchCase="representationConstants.document"
      [src]="representationsToDisplay[0]"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-document>

    <app-audio
      #audio
      class="dsp-representation audio"
      *ngSwitchCase="representationConstants.audio"
      [src]="representationsToDisplay[0]"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-audio>

    <app-video
      #video
      class="dsp-representation video"
      *ngSwitchCase="representationConstants.movingImage"
      [src]="representationsToDisplay[0]"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-video>

    <app-archive
      #archive
      class="dsp-representation archive"
      *ngSwitchCase="representationConstants.archive"
      [src]="representationsToDisplay[0]"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-archive>

    <app-text
      #text
      class="dsp-representation text"
      *ngSwitchCase="representationConstants.text"
      [src]="representationsToDisplay[0]"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-text>

    <span *ngSwitchDefault>
      The file representation type "{{ representationsToDisplay[0].fileValue.type }}" is not yet implemented
    </span>
  </div>`,
})
export class ResourceRepresentationsComponent {
  @Input({ required: true }) resource!: DspResource;
  @Input({ required: true }) representationsToDisplay!: FileRepresentation[];

  loading = false;
  protected readonly representationConstants = RepresentationConstants;

  representationLoaded(e: boolean) {
    this.loading = !e;
  }
}
