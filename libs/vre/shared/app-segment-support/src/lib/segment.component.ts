import { Component, Input, OnInit } from '@angular/core';
import { MediaControlService } from './media-control.service';
import { Segment } from './segment';
import { SegmentsService } from './segments.service';

@Component({
  selector: 'app-segment',
  template: `
    <div
      class="segment-container"
      [ngStyle]="{ width: width + '%', left: start + '%', top: row * rowHeight + 'px' }"
      (mouseenter)="showHover = true"
      (mouseleave)="showHover = false">
      <div class="segment" (click)="playVideo()" [matTooltip]="segment.label">
        <mat-icon style="margin-right: 4px; flex-shrink: 0">play_circle</mat-icon>
        <span class="mat-body-2 label">{{ segment.label }}</span>
      </div>
      <div
        style="position: absolute; right: -40px; width: 40px; top: 0; height: 30px; background: black; color: white;
    display: flex;
    justify-content: center;
    align-items: center;"
        *ngIf="showHover"
        (click)="segmentsSevice.highlightSegment(segment)">
        <mat-icon>keyboard_arrow_down</mat-icon>
      </div>
    </div>
  `,
  styles: [
    `
      .segment-container {
        position: absolute;
        height: 30px;
        cursor: pointer;
      }

      .segment {
        width: 100%;
        height: 100%;
        background: lightblue;
        color: white;
        display: flex;
        justify-content: center;

        align-items: center;
        overflow: hidden;

        &:hover {
          background: #9fd6e8;
        }
      }

      .label {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    `,
  ],
})
export class SegmentComponent implements OnInit {
  @Input({ required: true }) segment!: Segment;
  @Input({ required: true }) row!: number;
  @Input({ required: true }) videoLengthSecs!: number;

  width!: number;
  start!: number;
  showHover = false;

  readonly rowHeight = 40;

  readonly segmentRightMargin = 0.2;

  play = false;

  constructor(
    public mediaControl: MediaControlService,
    public segmentsSevice: SegmentsService
  ) {}

  ngOnInit() {
    this.width =
      ((this.segment.hasSegmentBounds.end - this.segment.hasSegmentBounds.start) * 100) / this.videoLengthSecs -
      this.segmentRightMargin;
    this.start = (this.segment.hasSegmentBounds.start / this.videoLengthSecs) * 100;
  }

  playVideo() {
    this.mediaControl.playMedia(this.segment.hasSegmentBounds.start, this.segment.hasSegmentBounds.end);
    this.play = !this.play;
  }
}
