import { Component, Input, OnChanges } from '@angular/core';
import { Segment } from './segment';

interface SegmentWithRow {
  segment: Segment;
  row: number;
}

@Component({
  selector: 'app-segments-display',
  template: ` <div style="position: relative" [ngStyle]="{ height: height + 'px' }">
    <app-segment
      *ngFor="let segment of segmentsWithRow"
      [segment]="segment.segment"
      [row]="segment.row"
      [videoLengthSecs]="videoLengthSecs" />
  </div>`,
})
export class SegmentsDisplayComponent implements OnChanges {
  @Input({ required: true }) segments!: Segment[];
  @Input({ required: true }) videoLengthSecs!: number;

  segmentsWithRow!: SegmentWithRow[];
  height!: number;
  readonly rowHeight = 40;

  ngOnChanges() {
    this.segments = this.orderByStartAndLength(this.segments);
    this.segmentsWithRow = this.segments.reduce((prev, currentValue) => {
      const lastRow = prev.length > 0 ? prev[prev.length - 1].row : 0;
      const segmentsFromLastRow = prev.filter(seg => seg.row === lastRow);

      const canBeInLastRow = segmentsFromLastRow.reduce((prev_, current_) => {
        return (
          (currentValue.hasSegmentBounds.start >= current_.segment.hasSegmentBounds.end ||
            currentValue.hasSegmentBounds.end <= current_.segment.hasSegmentBounds.start) &&
          prev_
        );
      }, true);

      return [...prev, { segment: currentValue, row: canBeInLastRow ? lastRow : lastRow + 1 }];
    }, [] as SegmentWithRow[]);

    this.height = (this.segmentsWithRow[this.segmentsWithRow.length - 1].row + 1) * this.rowHeight;
  }

  orderByStartAndLength(segments: Segment[]) {
    return segments.sort((a, b) => {
      if (a.hasSegmentBounds.start === b.hasSegmentBounds.start) {
        return b.hasSegmentBounds.end - b.hasSegmentBounds.start - (a.hasSegmentBounds.end - a.hasSegmentBounds.start);
      }
      return a.hasSegmentBounds.start - b.hasSegmentBounds.start;
    });
  }
}
