import { ReadIntervalValue, ReadLinkValue, ReadTextValueAsString } from '@dasch-swiss/dsp-js';

export interface Segment {
  label: string;
  hasSegmentBounds: ReadIntervalValue;
  hasVideoSegmentOfValue: ReadLinkValue | undefined;
  hasComment: ReadTextValueAsString | undefined;
  hasDescription: ReadTextValueAsString | undefined;
  hasKeyword: ReadTextValueAsString | undefined;
  hasTitle: ReadTextValueAsString | undefined;
}
