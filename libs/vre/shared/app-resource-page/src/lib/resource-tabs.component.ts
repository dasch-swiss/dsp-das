import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { DspResource, PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { RegionService } from '@dasch-swiss/vre/shared/app-representations';
import { CompoundService } from './compound/compound.service';

@Component({
  selector: 'app-resource-tabs',
  template: `
    <mat-tab-group
      *ngIf="!resource.res.isDeleted"
      animationDuration="0ms"
      [(selectedIndex)]="selectedTab"
      (selectedTabChange)="tabChanged($event)">
      <mat-tab #matTabProperties [label]="'appLabels.resource.properties' | translate">
        <app-properties-display *ngIf="resourceProperties" [resource]="resource" [properties]="resourceProperties" />
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

      <mat-tab label="Annotations">
        <ng-template matTabLabel class="annotations">
          <span [matBadge]="regionService.regions.length" matBadgeColor="primary" matBadgeOverlap="false">
            Annotations
          </span>
        </ng-template>
        <app-annotation-tab *ngIf="annotationTabSelected && regionService.regions.length > 0" [resource]="resource" />
      </mat-tab>
    </mat-tab-group>
  `,
})
export class ResourceTabsComponent implements OnInit, OnChanges {
  @Input({ required: true }) resource!: DspResource;

  selectedTab = 0;

  constructor(
    public regionService: RegionService,
    public compoundService: CompoundService,
    private _route: ActivatedRoute
  ) {}

  resourceProperties!: PropertyInfoValues[];
  annotationTabSelected = false;

  resourceClassLabel = (resource: DspResource) => resource.res.entityInfo?.classes[resource.res.type].label;

  tabChanged(event: MatTabChangeEvent) {
    this.annotationTabSelected = event.tab.textLabel === 'Annotations';
  }

  ngOnInit() {
    this.regionService.regionAdded$.subscribe(() => {});

    this._highlightAnnotationFromUri();
  }

  ngOnChanges() {
    this.resourceProperties = this.resource.resProps
      .filter(prop => !prop.propDef['isLinkProperty'])
      .filter(prop => !prop.propDef.subPropertyOf.includes('http://api.knora.org/ontology/knora-api/v2#hasFileValue'));
  }

  private _highlightAnnotationFromUri() {
    const annotation = this._route.snapshot.queryParamMap.get(RouteConstants.annotationQueryParam);
    if (!annotation) {
      return;
    }
    setTimeout(() => {
      this._openAnnotationTab();
      this.regionService.highlightRegion(annotation);
    }, 1000);
  }

  private _openAnnotationTab() {
    this.selectedTab = 2;
  }
}
