import { Component, Input, OnInit } from '@angular/core';
import { MediaControlService } from './media-control.service';
import { Segment } from './segment';

@Component({
  selector: 'app-segment',
  template: `
    <div
      class="segment"
      [appCustomTooltip]="segment"
      [ngStyle]="{ width: width + '%', left: start + '%', top: segment.row * rowHeight + 'px' }"
      (click)="playMedia()"></div>
  `,
  styleUrls: ['./segment.component.scss'],
})
export class SegmentComponent implements OnInit {
  @Input({ required: true }) segment!: Segment;
  @Input({ required: true }) videoLengthSecs!: number;

  width!: number;
  start!: number;

  readonly rowHeight = 8;

  readonly segmentRightMargin = 0.2;

  play = false;

  constructor(public mediaControl: MediaControlService) {}

  ngOnInit() {
    this.width =
      ((this.segment.hasSegmentBounds.end - this.segment.hasSegmentBounds.start) * 100) / this.videoLengthSecs -
      this.segmentRightMargin;
    this.start = (this.segment.hasSegmentBounds.start / this.videoLengthSecs) * 100;
  }

  playMedia() {
    this.mediaControl.playMedia(this.segment.hasSegmentBounds.start, this.segment.hasSegmentBounds.end);
    this.play = !this.play;
  }
}
