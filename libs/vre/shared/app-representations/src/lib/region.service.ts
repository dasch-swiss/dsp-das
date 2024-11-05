import { Injectable } from '@angular/core';
import { ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { DspResource, GenerateProperty } from '@dasch-swiss/vre/shared/app-common';
import { IncomingService } from '@dasch-swiss/vre/shared/app-common-to-move';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

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

  private _selectedRegion = new BehaviorSubject<string | null>(null);
  selectedRegion$ = this._selectedRegion.asObservable();

  constructor(private _incomingService: IncomingService) {}

  showRegions(value: boolean) {
    this._showRegions.next(value);
  }

  updateRegions(resourceId = this._resourceId) {
    this._getIncomingRegions(resourceId).subscribe(res => {
      this._regionsSubject.next(res);
      this._resourceId = resourceId;
    });
  }

  selectRegion(regionIri: string) {
    this._selectedRegion.next(regionIri);
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
