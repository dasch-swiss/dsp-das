import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Segment } from './segment';
import { SegmentsService } from './segments.service';

@Component({
  selector: 'app-custom-tooltip',
  template: ` <div style="display: flex; align-items: center; background: red; padding: 20px">
    <div>{{ segment.label }} {{ index }}</div>
    <mat-icon (click)="segmentsService.highlightSegment(segment)">arrow_downward</mat-icon>
  </div>`,
})
export class CustomTooltipComponent {
  segment!: Segment;
  index!: number;

  constructor(public segmentsService: SegmentsService) {}

  @Output() mouseEnter = new EventEmitter<void>();
  @Output() mouseLeave = new EventEmitter<void>();

  @HostListener('mouseenter')
  onMouseEnter() {
    this.mouseEnter.emit();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.mouseLeave.emit();
  }
}
