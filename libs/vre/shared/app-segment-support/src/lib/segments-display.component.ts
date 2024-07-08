import { Component, Input, OnChanges } from '@angular/core';
import { Segment } from './segment';

@Component({
  selector: 'app-segments-display',
  template: ` <div style="position: relative; background: black" [ngStyle]="{ height: height + 'px' }">
    <app-segment *ngFor="let segment of segments" [segment]="segment" [videoLengthSecs]="videoLengthSecs" />
  </div>`,
})
export class SegmentsDisplayComponent implements OnChanges {
  @Input({ required: true }) segments!: Segment[];
  @Input({ required: true }) videoLengthSecs!: number;

  height!: number;
  readonly rowHeight = 40;

  ngOnChanges() {
    this.height = (this.segments[this.segments.length - 1].row + 1) * this.rowHeight;
  }
}
