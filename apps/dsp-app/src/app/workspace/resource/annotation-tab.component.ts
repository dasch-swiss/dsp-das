import { Component, Input } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import {
  FileRepresentation,
  RepresentationConstants,
} from '@dsp-app/src/app/workspace/resource/representation/file-representation';

@Component({
  selector: 'app-annotation-tab',
  template: ` <mat-tab
    label="annotations"
    *ngIf="
      representationsToDisplay?.length &&
      representationsToDisplay[0].fileValue &&
      representationsToDisplay[0].fileValue.type === representationConstants.stillImage
    ">
    <ng-template matTabLabel class="annotations">
      <span
        [matBadge]="representationsToDisplay[0]?.annotations.length"
        [matBadgeHidden]="representationsToDisplay[0]?.annotations.length === 0"
        matBadgeColor="primary"
        matBadgeOverlap="false">
        Annotations
      </span>
    </ng-template>
    <div
      class="region-property"
      *ngFor="let annotation of annotationResources; trackBy: trackAnnotationByFn"
      [id]="annotation.res.id"
      [class.active]="annotation.res.id === selectedRegion">
      <app-properties-display [resource]="annotation" [properties]="annotation.resProps" isAnnotation="true">
      </app-properties-display>
    </div>
  </mat-tab>`,
})
export class AnnotationTabComponent {
  @Input({ required: true }) annotationResources: DspResource[];
  @Input({ required: true }) representationsToDisplay: FileRepresentation[];
  @Input({ required: true }) selectedRegion!: string;

  protected readonly representationConstants = RepresentationConstants;

  trackAnnotationByFn = (index: number, item: DspResource) => `${index}-${item.res.id}`;
}
