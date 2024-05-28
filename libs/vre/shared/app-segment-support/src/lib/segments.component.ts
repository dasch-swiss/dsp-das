import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateSegmentDialogComponent } from './create-segment-dialog.component';
import { Segment } from './segment';
import { SegmentApiService } from './segment-api.service';

@Component({
  selector: 'app-segments',
  template:
    'SEGMENTS: <button mat-raised-button (click)="add()">  ADD</button><button mat-raised-button (click)="getVideoSegment()">GET</button><app-segment *ngFor="let segment of segments" [segment]="segment"></app-segment>',
})
export class SegmentsComponent {
  segments: Segment[] = [];

  constructor(
    private _segmentApi: SegmentApiService,
    private _dialog: MatDialog
  ) {}

  add() {
    this._dialog
      .open(CreateSegmentDialogComponent)
      .afterClosed()
      .subscribe(() => {
        this.getVideoSegment();
      });
  }

  getVideoSegment() {
    this._segmentApi.getVideoSegment('http://rdfh.ch/0007/O8zFpWWfRd2StNNwmZ23-Q').subscribe(value => {
      this.segments = value;
    });
  }
}
