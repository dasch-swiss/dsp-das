import { Injectable } from '@angular/core';
import { DspCompoundPosition } from '@dasch-swiss/vre/shared/app-common';
import { IncomingRepresentationsService } from '@dsp-app/src/app/workspace/resource/incoming-representations.service';

@Injectable()
export class CompoundService {
  compoundNavigation!: DspCompoundPosition;

  constructor(private incomingRepresentationsService: IncomingRepresentationsService) {}

  onInit(_compound: DspCompoundPosition) {
    this.compoundNavigation = _compound;
  }

  openPage(page: number) {
    // this.regionDrawMode = false;
    this.incomingRepresentationsService.compoundNavigation(page);
  }
}
