import { Component } from '@angular/core';
import { SegmentsService } from '@dasch-swiss/vre/shared/app-segment-support';

@Component({
  selector: 'app-segment-tab',
  template: ` <app-properties-display
    *ngFor="let resource of segmentsService.resources"
    [resource]="resource"
    [properties]="resource.resProps" />`,
})
export class SegmentTabComponent {
  constructor(public segmentsService: SegmentsService) {}
}
