import { Injectable } from '@angular/core';
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

  displayRegions(value: boolean) {
    this._showRegions.next(value);
  }

  highlightRegion(region: string) {
    this._highlightRegion.next(region);
  }

  addRegion(region: string) {
    this._regionAdded.next(region);
  }
}
