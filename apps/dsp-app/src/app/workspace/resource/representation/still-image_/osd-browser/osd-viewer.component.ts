import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Point2D, ReadStillImageFileValue } from '@dasch-swiss/dsp-js';
import { ReadFileValue } from '@dasch-swiss/dsp-js/src/models/v2/resources/values/read/read-file-value';
import { DspCompoundPosition } from '@dsp-app/src/app/workspace/resource/dsp-resource';

export interface ReadStillImageExternalFileValue extends ReadFileValue {
  dimX: number;
  dimY: number;
  iiifBaseUrl: string;
}

export interface RegionElement {
  startPoint: Point2D;
  endPoint: Point2D;
  imageSize: Point2D;
  overlay: Element;
}

@Component({
  selector: 'app-osd-viewer',
  templateUrl: './osd-viewer.component.html',
  styleUrls: ['./osd-viewer.component.scss'],
})
export class OsdViewerComponent {
  @Input() image: ReadStillImageFileValue | ReadStillImageExternalFileValue;
  @Input() compoundPosition: DspCompoundPosition;

  @Input() draw: boolean = false;

  @Output() region = new EventEmitter<RegionElement>();

  @Output() page = new EventEmitter<number>();
}
