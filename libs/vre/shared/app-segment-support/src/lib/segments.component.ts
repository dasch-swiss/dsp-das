import { Component } from '@angular/core';
import { SegmentApiService } from './segment-api.service';

@Component({
  selector: 'app-segments',
  template:
    'SEGMENTS: <button mat-raised-button (click)="add()">  ADD</button><button mat-raised-button (click)="getSegment()">GET</button><app-segment></app-segment>',
})
export class SegmentsComponent {
  constructor(private _segmentApi: SegmentApiService) {}

  add() {
    this._segmentApi.create().subscribe();
  }

  getSegment() {
    this._segmentApi.getSegment().subscribe();
  }
}
