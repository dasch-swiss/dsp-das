import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { RegionService } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource, ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-annotation-tab',
  template: ` <div
    *ngFor="let annotation of regionService.regions$ | async; trackBy: trackAnnotationByFn"
    [id]="annotation.res.id"
    [class.active]="annotation.res.id === selectedRegion"
    data-cy="annotation-border">
    <app-properties-display
      [resource]="annotation"
      [properties]="annotation.resProps"
      [displayLabel]="true"
      [linkToNewTab]="
        resourceService.getResourcePath(resource.res.id) +
        '?' +
        RouteConstants.annotationQueryParam +
        '=' +
        annotation.res.id
      "
      (afterResourceDeleted)="afterResourceDeleted()" />
  </div>`,
  styles: ['.active {border: 1px solid}'],
})
export class AnnotationTabComponent implements OnInit, OnDestroy {
  @Input({ required: true }) resource!: DspResource;
  selectedRegion: string | null = null;

  private _subscription!: Subscription;

  constructor(
    public regionService: RegionService,
    public resourceService: ResourceService
  ) {}

  ngOnInit() {
    this._subscription = this.regionService.selectedRegion$.subscribe(region => {
      this.selectedRegion = region;
      if (region !== null) {
        this._scrollToRegion(region);
      }
    });
  }

  afterResourceDeleted() {
    this.regionService.updateRegions$().pipe(take(1)).subscribe();
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  trackAnnotationByFn = (index: number, item: DspResource) => `${index}-${item.res.id}`;
  protected readonly RouteConstants = RouteConstants;

  private _scrollToRegion(iri: string) {
    const elements = document.querySelectorAll(`#${CSS.escape(iri)}`);

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      if (!element.classList.contains('region')) {
        element.scrollIntoView({
          behavior: 'smooth',
        });
        break;
      }
    }
  }
}
