import { ChangeDetectorRef, Injectable } from '@angular/core';
import { ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { DspResource, GenerateProperty } from '@dasch-swiss/vre/shared/app-common';
import { IncomingService } from '@dasch-swiss/vre/shared/app-common-to-move';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/**
 * Regions, also called annotations, are used to mark specific areas on an image.
 */
@Injectable()
export class RegionService {
  private _resourceId = '';

  private _regionsSubject = new BehaviorSubject<DspResource[]>([]);
  regions$ = this._regionsSubject.asObservable();

  get regions() {
    return this._regionsSubject.value;
  }

  private _showRegions = new BehaviorSubject(false);
  showRegions$ = this._showRegions.asObservable();

  private _highlightRegion = new BehaviorSubject<string | null>(null);
  highlightRegion$ = this.showRegions$.pipe(
    switchMap(value => (value ? this._highlightRegion.asObservable() : of(null)))
  );

  constructor(
    private _incomingService: IncomingService,
    private _cd: ChangeDetectorRef
  ) {}

  showRegions(value: boolean) {
    this._showRegions.next(value);
  }

  updateRegions(resourceId = this._resourceId) {
    this._getIncomingRegions(resourceId).subscribe(res => {
      this._regionsSubject.next(res);
      this._resourceId = resourceId;
      this._cd.markForCheck();
    });
  }

  highlightRegion(regionIri: string) {
    this._highlightRegion.next(regionIri);
    this._cd.markForCheck();
  }

  private _getIncomingRegions(resourceId: string) {
    const offset = 0;
    return this._incomingService.getIncomingRegions(resourceId, offset).pipe(
      map(regions =>
        (regions as ReadResourceSequence).resources.map(_resource => {
          const z = new DspResource(_resource);
          z.resProps = GenerateProperty.regionProperty(_resource);
          return z;
        })
      )
    );
  }
}
