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
    this._segmentApi.getSegment('http://rdfh.ch/0803/O5J50GVGTZ2W4ZyC5ZM5HQ').subscribe();
  }
}
