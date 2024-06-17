import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Segment } from './segment';
import { SegmentApiService } from './segment-api.service';

@Injectable()
export class SegmentsService {
  segments: Segment[] = [];

  private _highlightSegment = new BehaviorSubject<Segment | null>(null);
  highlightSegment$ = this._highlightSegment.asObservable();

  constructor(private _segmentApi: SegmentApiService) {}

  onInit(resourceIri: string) {
    this.getVideoSegment(resourceIri);
  }

  getVideoSegment(resourceIri: string) {
    this._segmentApi.getVideoSegment(resourceIri).subscribe(value => {
      this.segments = value.reverse();
      console.log(this.segments);
    });
  }

  highlightSegment(segment: Segment) {
    this._highlightSegment.next(segment);
  }
}
