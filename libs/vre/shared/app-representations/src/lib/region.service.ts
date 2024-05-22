import { Injectable } from '@angular/core';
import { ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IncomingService } from '@dasch-swiss/vre/shared/app-resource-properties';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class RegionService {
  private _showRegions = new BehaviorSubject(false);
  showRegions$ = this._showRegions.asObservable();

  private _highlightRegion = new BehaviorSubject<string | null>(null);
  highlightRegion$ = this.showRegions$.pipe(
    switchMap(value => (value ? this._highlightRegion.asObservable() : of(null)))
  );

  private _regionAdded = new Subject<string>();
  regionAdded$ = this._regionAdded.asObservable();

  constructor(private _incomingService: IncomingService) {}

  displayRegions(value: boolean) {
    this._showRegions.next(value);
  }

  highlightRegion(region: string) {
    this._highlightRegion.next(region);
  }

  addRegion(region: string) {
    this._regionAdded.next(region);
  }

  // TODO this is shit.
  getIncomingRegions(resource: DspResource, offset: number): void {
    this._incomingService.getIncomingRegions(resource.res.id, offset).subscribe(regions => {
      Array.prototype.push.apply(resource.incomingAnnotations, (regions as ReadResourceSequence).resources);
    });
  }
}
