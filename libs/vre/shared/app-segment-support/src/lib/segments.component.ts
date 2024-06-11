import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { SegmentsService } from './segments.service';

@Component({
  selector: 'app-segments',
  template: `
    'SEGMENTS:
    <button mat-raised-button (click)="deleteVideoSegment()">DELETE</button>
    <button mat-raised-button (click)="segmentsService.getVideoSegment(resource.id)">GET</button>
    <app-segments-display *ngIf="segmentsService.segments.length > 0" [segments]="segmentsService.segments" />
  `,
})
export class SegmentsComponent implements OnInit {
  @Input({ required: true }) resource!: ReadResource;

  constructor(
    private _dialog: MatDialog,
    public segmentsService: SegmentsService
  ) {}

  ngOnInit() {
    this.segmentsService.onInit(this.resource.id);
  }

  deleteVideoSegment() {}
}
