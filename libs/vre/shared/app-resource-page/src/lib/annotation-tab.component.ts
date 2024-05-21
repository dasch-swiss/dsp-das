import { Component, Input, OnInit } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { FileRepresentation } from '@dasch-swiss/vre/shared/app-representations';

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
export class AnnotationTabComponent implements OnInit {
  @Input({ required: true }) annotationResources: DspResource[];
  @Input({ required: true }) representationsToDisplay: FileRepresentation[];
  @Input({ required: true }) selectedRegion!: string;

  ngOnInit() {
    console.log('init');
  }

  trackAnnotationByFn = (index: number, item: DspResource) => `${index}-${item.res.id}`;
}
