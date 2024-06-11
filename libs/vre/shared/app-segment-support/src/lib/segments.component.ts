import { Component, Input, OnInit } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { SegmentsService } from './segments.service';

@Component({
  selector: 'app-segments',
  template: ' <button mat-raised-button (click)="segmentsService.getVideoSegment(resource.id)">GET</button> ',
})
export class SegmentsComponent implements OnInit {
  @Input({ required: true }) resource!: ReadResource;
  @Input({ required: true }) videoLengthSecs!: number;

  constructor(public segmentsService: SegmentsService) {}

  ngOnInit() {}
}
