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

  onInit(resourceIri: string, type: 'VideoSegment' | 'AudioSegment') {
    this.getSegment(resourceIri, type);
  }

  getSegment(resourceIri: string, type: 'VideoSegment' | 'AudioSegment') {
    this._segmentApi.getSegment(type, resourceIri).subscribe(value => {
      this.segments = value;
    });
  }

  highlightSegment(segment: Segment) {
    this._highlightSegment.next(segment);
  }
}
