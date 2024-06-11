import { Component, Input, OnInit } from '@angular/core';
import { MediaControlService } from '@dasch-swiss/vre/shared/app-representations';
import { Segment } from './segment';

@Component({
  selector: 'app-segment',
  template: `
    <div
      style="height: 30px; background: lightblue; color: white; position: absolute;
    display: flex;
    justify-content: center;
    align-items: center; cursor: pointer"
      [ngStyle]="{ width: width + '%', left: start + '%', top: row * rowHeight + 'px' }"
      (click)="playVideo()">
      <mat-icon style="margin-right: 4px">play_circle</mat-icon>
      <span class="mat-body-2">{{ segment.label }}</span>
    </div>
  `,
})
export class SegmentComponent implements OnInit {
  @Input({ required: true }) segment!: Segment;
  @Input({ required: true }) row!: number;
  @Input({ required: true }) videoLengthSecs!: number;

  width!: number;
  start!: number;
  readonly rowHeight = 40;

  readonly segmentRightMargin = 0.2;

  play = false;

  constructor(public _mediaControl: MediaControlService) {}

  ngOnInit() {
    this.width =
      ((this.segment.hasSegmentBounds.end - this.segment.hasSegmentBounds.start) * 100) / this.videoLengthSecs -
      this.segmentRightMargin;
    this.start = (this.segment.hasSegmentBounds.start / this.videoLengthSecs) * 100;
  }

  playVideo() {
    this._mediaControl.playMedia(this.segment.hasSegmentBounds.start);
    this.play = !this.play;
  }
}
