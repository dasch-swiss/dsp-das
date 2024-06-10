import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateSegmentDialogComponent, CreateSegmentDialogProps } from './create-segment-dialog.component';
import { Segment } from './segment';
import { SegmentApiService } from './segment-api.service';

@Component({
  selector: 'app-segments',
  template: `
    'SEGMENTS:
    <button mat-raised-button (click)="add()">ADD</button>
    <button mat-raised-button (click)="deleteVideoSegment()">DELETE</button>
    <button mat-raised-button (click)="getVideoSegment()">GET</button>
    <app-segment *ngFor="let segment of segments" [segment]="segment"></app-segment>
  `,
})
export class SegmentsComponent {
  @Input({ required: true }) resourceIri!: string;
  segments: Segment[] = [];

  constructor(
    private _segmentApi: SegmentApiService,
    private _dialog: MatDialog
  ) {}

  add() {
    this._dialog
      .open<CreateSegmentDialogComponent, CreateSegmentDialogProps>(CreateSegmentDialogComponent, {
        data: { resourceIri: this.resourceIri },
      })
      .afterClosed()
      .subscribe(() => {
        this.getVideoSegment();
      });
  }

  deleteVideoSegment() {
    this.segments.map(segment => {
      console.log(`Segment ${segment.label} has been deleted`);
    });
  }

  getVideoSegment() {
    this._segmentApi.getVideoSegment(this.resourceIri).subscribe(value => {
      this.segments = value;
    });
  }
}
