import { Injectable } from '@angular/core';
import { RegionElement } from '@dsp-app/src/app/workspace/resource/representation/still-image_/osd-viewer/osd-viewer.component';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegionService {
  private _regionsSource = new BehaviorSubject<RegionElement[]>([]);
  public regions$: Observable<RegionElement[]> = this._regionsSource.asObservable();

  private _activeRegionSource = new BehaviorSubject<string | null>(null);
  public activeRegion$: Observable<string | null> = this._activeRegionSource.asObservable();

  regions: RegionElement[] = [];

  private _isDrawing = new BehaviorSubject<boolean>(false);
  public isDrawing$: Observable<boolean> = this._isDrawing.asObservable();

  constructor() {}

  setActiveRegion(regionId: string | null) {
    this._activeRegionSource.next(regionId);
  }

  // either drawing a new or editing
  draw() {
    // Implementation for drawing a region
  }

  onRegionAdded(newRegion: RegionElement) {
    const currentRegions = this._regionsSource.value;
    this._regionsSource.next([...currentRegions, newRegion]);
  }

  onRegionRemoved(regionId: string) {
    const currentRegions = this._regionsSource.value;
    const updatedRegions = [];
    this._regionsSource.next(updatedRegions);
  }

  onRegionUpdated(updatedRegion: RegionElement) {
    const currentRegions = this._regionsSource.value;
    const updatedRegions = [];
    this._regionsSource.next(updatedRegions);
  }
}
