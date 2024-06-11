import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { SegmentsService } from '@dasch-swiss/vre/shared/app-segment-support';

@Component({
  selector: 'app-segment-tab',
  template: ` <app-properties-display
    *ngFor="let resource of segmentsService.resources"
    [resource]="resource"
    [properties]="resource.resProps"
    [displayLabel]="true" />`,
})
export class SegmentTabComponent {
  @Input({ required: true }) resource!: ReadResource;

  constructor(public segmentsService: SegmentsService) {}
}
