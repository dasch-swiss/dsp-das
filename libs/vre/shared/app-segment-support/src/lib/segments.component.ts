import { Component } from '@angular/core';
import { SegmentApiService } from './segment-api.service';

@Component({
  selector: 'app-segments',
  template: 'SEGMENTS: <button mat-raised-button (click)="add()">  ADD</button><app-segment></app-segment>',
})
export class SegmentsComponent {
  constructor(private _segmentApi: SegmentApiService) {}

  add() {
    this._segmentApi.create().subscribe();
  }
}
