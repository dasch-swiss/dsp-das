import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '@dasch-swiss/dsp-js';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { RegionService } from '@dasch-swiss/vre/shared/app-representations';
import { SegmentsService } from '@dasch-swiss/vre/shared/app-segment-support';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CompoundService } from './compound/compound.service';

@Component({
  selector: 'app-resource-tabs',
  template: `
    <mat-tab-group
      *ngIf="!resource.res.isDeleted"
      animationDuration="0ms"
      [(selectedIndex)]="selectedTab"
      (selectedTabChange)="onTabChange($event)">
      <mat-tab #matTabProperties [label]="'resource.properties' | translate">
        <app-properties-display *ngIf="resource" [resource]="resource" [properties]="resource.resProps" />
      </mat-tab>

      <mat-tab
        *ngIf="compoundService.incomingResource as incomingResource"
        #matTabIncoming
        [label]="resourceClassLabel(incomingResource)">
        <app-properties-display
          [resource]="incomingResource"
          [properties]="incomingResource.resProps"
          [displayLabel]="true" />
      </mat-tab>

      <!-- annotations -->
      <mat-tab label="Annotations" *ngIf="displayAnnotations">
        <ng-template matTabLabel>
          <span [matBadge]="regionService.regions.length" matBadgeColor="primary" matBadgeOverlap="false">
            Annotations
          </span>
        </ng-template>
        <app-annotation-tab *ngIf="regionService.regions.length > 0" [resource]="resource" />
      </mat-tab>

      <mat-tab label="Segments" *ngIf="segmentsService.segments && segmentsService.segments.length > 0">
        <ng-template matTabLabel>
          <span [matBadge]="segmentsService.segments.length" matBadgeColor="primary" matBadgeOverlap="false">
            Segments
          </span>
        </ng-template>
        <app-segment-tab [resource]="resource.res" />
      </mat-tab>
    </mat-tab-group>
  `,
})
export class ResourceTabsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) resource!: DspResource;

  selectedTab = 0;

  private ngUnsubscribe = new Subject<void>();

  get displayAnnotations() {
    return this.resource.res.properties[Constants.HasStillImageFileValue] !== undefined || this.compoundService.exists;
  }

  constructor(
    public regionService: RegionService,
    public compoundService: CompoundService,
    public segmentsService: SegmentsService,
    private _route: ActivatedRoute
  ) {}

  resourceClassLabel = (resource: DspResource) => resource.res.entityInfo?.classes[resource.res.type].label;

  ngOnInit() {
    this._highlightAnnotationFromUri();

    this.segmentsService.highlightSegment$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(segment => {
      if (segment) {
        this.selectedTab = 1;
      }
    });

    this.regionService.highlightRegion$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(region => {
      if (region) {
        this.selectedTab = 2;
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.unsubscribe();
  }

  private _highlightAnnotationFromUri() {
    const annotation = this._route.snapshot.queryParamMap.get(RouteConstants.annotationQueryParam);
    if (!annotation) {
      return;
    }

    this.regionService.showRegions$
      .pipe(
        filter(loaded => loaded),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this._openAnnotationTab();
        this.regionService.highlightRegion(annotation);
      });
  }

  onTabChange(event: any) {
    if (
      (this.compoundService.incomingResource && event.index === 2) ||
      (!this.compoundService.incomingResource && event.index === 1)
    ) {
      this._openAnnotationTab();
    } else {
      this.regionService.showRegions(false);
    }
  }

  private _openAnnotationTab() {
    this.selectedTab = 2;
    this.regionService.showRegions(true);
  }
}
