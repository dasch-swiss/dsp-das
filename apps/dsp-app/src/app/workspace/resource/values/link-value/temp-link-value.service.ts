import { Injectable } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';

@Injectable()
export class TempLinkValueService {
  parentResource: ReadResource;
  currentOntoIri: string;
  propIri: string;
}
