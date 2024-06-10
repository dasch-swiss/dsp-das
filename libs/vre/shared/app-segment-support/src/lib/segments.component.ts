import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateSegmentDialogComponent, CreateSegmentDialogProps } from './create-segment-dialog.component';
import { SegmentsService } from './segments.service';

@Component({
  selector: 'app-segments',
  template: `
    'SEGMENTS:
    <button mat-raised-button (click)="add()">ADD</button>
    <button mat-raised-button (click)="deleteVideoSegment()">DELETE</button>
    <button mat-raised-button (click)="segmentsService.getVideoSegment(resourceIri)">GET</button>
    <app-segments-display *ngIf="segmentsService.segments.length > 0" [segments]="segmentsService.segments" />
  `,
})
export class SegmentsComponent implements OnInit {
  @Input({ required: true }) resourceIri!: string;

  constructor(
    private _dialog: MatDialog,
    public segmentsService: SegmentsService
  ) {}

  ngOnInit() {
    this.segmentsService.onInit(this.resourceIri);
  }

  add() {
    this._dialog
      .open<CreateSegmentDialogComponent, CreateSegmentDialogProps>(CreateSegmentDialogComponent, {
        data: { resourceIri: this.resourceIri },
      })
      .afterClosed()
      .subscribe(() => {
        this.segmentsService.getVideoSegment(this.resourceIri);
      });
  }

  deleteVideoSegment() {}
}
