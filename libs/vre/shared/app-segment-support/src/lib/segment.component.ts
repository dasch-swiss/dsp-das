import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateSegmentDialogComponent } from './create-segment-dialog.component';
import { Segment } from './segment';

@Component({
  selector: 'app-segment',
  template: `
    <div
      style="height: 38px; background: lightblue; color: white; position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;"
      [ngStyle]="{ width: width + '%', left: start + '%', top: row * rowHeight + 'px' }"
      (click)="edit()">
      {{ segment.label }}
    </div>
  `,
})
export class SegmentComponent implements OnInit {
  @Input({ required: true }) segment!: Segment;
  @Input({ required: true }) row!: number;

  width!: number;
  start!: number;
  videoLengthSecs = 200;
  readonly rowHeight = 40;

  constructor(private _dialog: MatDialog) {}

  ngOnInit() {
    this.width =
      ((this.segment.hasSegmentBounds.end - this.segment.hasSegmentBounds.start) * 100) / this.videoLengthSecs;
    this.start = (this.segment.hasSegmentBounds.start / this.videoLengthSecs) * 100;
  }

  edit() {
    this._dialog.open(CreateSegmentDialogComponent);
  }
}
