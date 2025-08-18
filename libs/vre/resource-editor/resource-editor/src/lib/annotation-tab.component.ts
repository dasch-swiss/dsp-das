import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { RegionService } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-annotation-tab',
  template: `
    <mat-accordion>
      <mat-expansion-panel
        #panel
        *ngFor="let annotation of regionService.regions$ | async; trackBy: trackAnnotationByFn"
        [attr.data-annotation-resource]="annotation.res.id"
        [class.active]="annotation.res.id === selectedRegion"
        [expanded]="annotation.res.id === selectedRegion"
        (opened)="selectedRegion = annotation.res.id"
        data-cy="annotation-border">
        <mat-expansion-panel-header (opened)="selectedRegion = annotation.res.id">
          <div style="width: 100%; display: flex; align-items: center; justify-content: space-between">
            <div>
              <h3 class="label" data-cy="property-header">
                {{ annotation.res.label }}
              </h3>
            </div>
            <div style="display: flex; align-items: center;">
              <app-annotation-toolbar
                style="width: 100%"
                [resource]="annotation.res"
                [parentResourceId]="resource.id"
                [toolBarActive]="annotation.res.id === selectedRegion"
                (click)="$event.stopPropagation()" />
            </div>
          </div>
        </mat-expansion-panel-header>
        <ng-container *ngIf="panel.expanded">
          <app-properties-display [resource]="annotation" [hideToolbar]="true"></app-properties-display>
        </ng-container>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: ['.active {border: 1px solid}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationTabComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) resource!: ReadResource;
  selectedRegion: string | null = null;

  private _subscription!: Subscription;

  constructor(
    private _cdr: ChangeDetectorRef,
    public regionService: RegionService
  ) {}

  ngAfterViewInit() {
    this._subscription = this.regionService.selectedRegion$.subscribe(region => {
      this.selectedRegion = region;
      this._scrollToRegion(region);
      this._cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  trackAnnotationByFn = (index: number, item: DspResource) => `${index}-${item.res.id}`;
  protected readonly RouteConstants = RouteConstants;

  private _scrollToRegion(iri: string | null) {
    const element = iri ? (document.querySelector(`[data-annotation-resource="${iri}"]`) as HTMLElement) : null;
    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}
