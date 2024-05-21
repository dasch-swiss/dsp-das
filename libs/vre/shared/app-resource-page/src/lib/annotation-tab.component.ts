import { Component, Input } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { FileRepresentation } from '@dsp-app/src/app/workspace/resource/representation/file-representation';

@Component({
  selector: 'app-annotation-tab',
  template: ` <div
    class="region-property"
    *ngFor="let annotation of annotationResources; trackBy: trackAnnotationByFn"
    [id]="annotation.res.id"
    [class.active]="annotation.res.id === selectedRegion">
    <app-properties-display [resource]="annotation" [properties]="annotation.resProps" isAnnotation="true">
    </app-properties-display>
  </div>`,
})
export class AnnotationTabComponent {
  @Input({ required: true }) annotationResources: DspResource[];
  @Input({ required: true }) representationsToDisplay: FileRepresentation[];
  @Input({ required: true }) selectedRegion!: string;

  trackAnnotationByFn = (index: number, item: DspResource) => `${index}-${item.res.id}`;
}
