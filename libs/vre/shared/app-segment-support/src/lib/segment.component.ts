import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MediaControlService } from '@dasch-swiss/vre/shared/app-representations';
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
      (click)="playVideo()">
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

  play = false;

  constructor(
    private _dialog: MatDialog,
    public _mediaControl: MediaControlService
  ) {}

  ngOnInit() {
    this.width =
      ((this.segment.hasSegmentBounds.end - this.segment.hasSegmentBounds.start) * 100) / this.videoLengthSecs;
    this.start = (this.segment.hasSegmentBounds.start / this.videoLengthSecs) * 100;
  }

  playVideo() {
    this._mediaControl.playMedia(!this.play);
    this.play = !this.play;
  }
}
