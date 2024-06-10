import { Injectable } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { Segment } from './segment';
import { SegmentApiService } from './segment-api.service';

@Injectable()
export class SegmentsService {
  segments: Segment[] = [];
  resources: DspResource[] = [];

  constructor(private _segmentApi: SegmentApiService) {}

  onInit(resourceIri: string) {
    this.getVideoSegment(resourceIri);
  }

  getVideoSegment(resourceIri: string) {
    this._segmentApi.getVideoSegment(resourceIri).subscribe(value => {
      this.segments = value.map(v => v.segment);
      this.resources = value.map(v => v.resource);
      console.log('a', this.resources);
    });
  }
}
