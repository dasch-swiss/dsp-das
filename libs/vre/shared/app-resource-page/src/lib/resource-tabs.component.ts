import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DspResource, PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { RepresentationConstants } from '@dasch-swiss/vre/shared/app-representations';
import { IncomingRepresentationsService } from './incoming-representations.service';

@Component({
  selector: 'app-resource-tabs',
  template: `
    <mat-tab-group
      *ngIf="!resource.res.isDeleted"
      animationDuration="0ms"
      [(selectedIndex)]="selectedTab"
      (selectedTabChange)="tabChanged.emit($event)">
      <!-- first tab for the main resource e.g. book -->
      <mat-tab #matTabProperties [label]="'appLabels.resource.properties' | translate">
        <app-properties-display
          *ngIf="resourceProperties"
          [resource]="resource"
          [properties]="resourceProperties"></app-properties-display>
      </mat-tab>

      <!-- incoming (compound object) resource -->
      <mat-tab
        *ngIf="incomingRepresentationsService.incomingResource as incomingResource"
        #matTabIncoming
        [label]="resourceClassLabel(incomingResource)">
        <app-properties-display
          [resource]="incomingResource"
          [properties]="incomingResource.resProps"></app-properties-display>
      </mat-tab>

      <!-- annotations -->
      <ng-container *ngIf="incomingRepresentationsService as irs">
        <mat-tab
          label="Annotations"
          *ngIf="
            irs.representationsToDisplay?.length &&
            irs.representationsToDisplay[0].fileValue &&
            irs.representationsToDisplay[0].fileValue.type === representationConstants.stillImage
          ">
          <ng-template matTabLabel class="annotations">
            <span
              [matBadge]="irs.representationsToDisplay[0]?.annotations.length"
              [matBadgeHidden]="irs.representationsToDisplay[0]?.annotations.length === 0"
              matBadgeColor="primary"
              matBadgeOverlap="false">
              Annotations
            </span>
          </ng-template>
          <app-annotation-tab
            *ngIf="irs.representationsToDisplay as representationsToDisplay"
            [representationsToDisplay]="representationsToDisplay"
            [selectedRegion]="selectedRegion"
            [annotationResources]="irs.annotationResources">
          </app-annotation-tab>
        </mat-tab>
      </ng-container>
    </mat-tab-group>
  `,
})
export class ResourceTabsComponent implements OnInit {
  @Input({ required: true }) resource!: DspResource;
  @Input({ required: true }) selectedRegion!: string;
  @Input({ required: true }) annotationResources!: DspResource[];
  @Input({ required: true }) selectedTab!: number;

  @Output() tabChanged = new EventEmitter<MatTabChangeEvent>();

  constructor(public incomingRepresentationsService: IncomingRepresentationsService) {}

  resourceProperties: PropertyInfoValues[];
  loading = true;

  resourceClassLabel = (resource: DspResource): string => resource.res.entityInfo?.classes[resource.res.type].label;

  ngOnInit() {
    this.resourceProperties = this.resource.resProps
      .filter(prop => !prop.propDef['isLinkProperty'])
      .filter(prop => !prop.propDef.subPropertyOf.includes('http://api.knora.org/ontology/knora-api/v2#hasFileValue'));
  }

  protected readonly representationConstants = RepresentationConstants;
}
