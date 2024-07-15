import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { expand, filter, tap } from 'rxjs/operators';
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
    const page = 0;
    this.getSegmentFromPage(resourceIri, type, page).subscribe(v => {
      this.segments = v;
    });
  }

  getSegmentFromPage(resourceIri: string, type: 'VideoSegment' | 'AudioSegment', page: number) {
    return this._segmentApi.getSegment(type, resourceIri, 0).pipe(
      expand(data => {
        if (data.length >= 25) {
          return this.getSegmentFromPage(resourceIri, type, page + 1);
        } else {
          return of(data);
        }
      }),
      filter(v => (v as Segment[]).length > 0)
    );
  }

  highlightSegment(segment: Segment) {
    this._highlightSegment.next(segment);
  }
}
