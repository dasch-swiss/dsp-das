import { Component, OnDestroy, OnInit } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { RegionService } from '@dasch-swiss/vre/shared/app-representations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-annotation-tab',
  template: ` <div
    class="region-property"
    *ngFor="let annotation of regionService.regions; trackBy: trackAnnotationByFn"
    [id]="annotation.res.id"
    [class.active]="annotation.res.id === selectedRegion">
    <app-properties-display [resource]="annotation" [properties]="annotation.resProps" [isAnnotation]="true" />
  </div>`,
  styles: ['.active {border: 1px solid}'],
})
export class AnnotationTabComponent implements OnInit, OnDestroy {
  selectedRegion: string | null = null;

  private _subscription!: Subscription;

  constructor(public regionService: RegionService) {}

  ngOnInit() {
    this._subscription = this.regionService.highlightRegion$.subscribe(region => {
      this.selectedRegion = region;
      if (region !== null) {
        this._openRegion(region);
      }
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  private _openRegion(iri: string) {
    const region = document.getElementById(iri);
    if (region) {
      region.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  trackAnnotationByFn = (index: number, item: DspResource) => `${index}-${item.res.id}`;
}
