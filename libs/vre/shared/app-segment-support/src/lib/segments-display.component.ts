import { Component, Input, OnChanges } from '@angular/core';
import { Segment } from './segment';

@Component({
  selector: 'app-segments-display',
  template: ` <div style="background: black; padding: 0 24px" [ngStyle]="{ height: height + 'px' }">
    <div style="position: relative">
      <app-segment *ngFor="let segment of segments" [segment]="segment" [videoLengthSecs]="videoLengthSecs" />
    </div>
  </div>`,
})
export class SegmentsDisplayComponent implements OnChanges {
  @Input({ required: true }) segments!: Segment[];
  @Input({ required: true }) videoLengthSecs!: number;

  height!: number;
  readonly rowHeight = 8;

  ngOnChanges() {
    this.height = (this.segments[this.segments.length - 1].row + 1) * this.rowHeight;
  }
}
