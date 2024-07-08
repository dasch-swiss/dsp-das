import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MediaControlService } from './media-control.service';
import { Segment } from './segment';
import { SegmentsService } from './segments.service';

@Component({
  selector: 'app-segment',
  template: `
    <div
      class="segment-container"
      #segmentContainer
      [ngStyle]="{ width: width + '%', left: start + '%', top: segment.row * rowHeight + 'px' }"
      (mouseenter)="showHover = true"
      (mouseleave)="showHover = false"
      (click)="playMedia()"
      [matTooltip]="segment.label">
      <div class="hover-button" style="" *ngIf="false && showHover" (click)="segmentsService.highlightSegment(segment)">
        <mat-icon>arrow_downward</mat-icon>
      </div>
    </div>
  `,
  styleUrls: ['./segment.component.scss'],
})
export class SegmentComponent implements OnInit {
  @Input({ required: true }) segment!: Segment;
  @Input({ required: true }) videoLengthSecs!: number;

  @ViewChild('segmentContainer') myElement!: ElementRef;

  width!: number;
  start!: number;
  showHover = false;

  readonly rowHeight = 40;

  readonly segmentRightMargin = 0.2;

  play = false;

  constructor(
    public mediaControl: MediaControlService,
    public segmentsService: SegmentsService
  ) {}

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
