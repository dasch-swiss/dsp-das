import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DspResource, PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import {
  FileRepresentation,
  RepresentationConstants,
} from '@dsp-app/src/app/workspace/resource/representation/file-representation';

@Component({
  selector: 'app-resource-tabs',
  template: `
    <!-- tabs -->
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
      <mat-tab *ngIf="incomingResource" #matTabIncoming [label]="'A' + resourceClassLabel(incomingResource) + 'B'">
        <app-properties-display
          [resource]="incomingResource"
          [properties]="incomingResource.resProps"></app-properties-display>
      </mat-tab>

      <!-- annotations -->
      <mat-tab
        label="annotations"
        *ngIf="
          representationsToDisplay?.length &&
          representationsToDisplay[0].fileValue &&
          representationsToDisplay[0].fileValue.type === representationConstants.stillImage
        ">
        <ng-template matTabLabel class="annotations">
          <span
            [matBadge]="representationsToDisplay[0]?.annotations.length"
            [matBadgeHidden]="representationsToDisplay[0]?.annotations.length === 0"
            matBadgeColor="primary"
            matBadgeOverlap="false">
            Annotations
          </span>
        </ng-template>
        <div
          class="region-property"
          *ngFor="let annotation of annotationResources; trackBy: trackAnnotationByFn"
          [id]="annotation.res.id"
          [class.active]="annotation.res.id === selectedRegion">
          <app-properties-display [resource]="annotation" [properties]="annotation.resProps" isAnnotation="true">
          </app-properties-display>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
})
export class ResourceTabsComponent implements OnInit {
  @Input({ required: true }) resource!: DspResource;
  @Input({ required: true }) incomingResource!: DspResource;
  @Input({ required: true }) representationsToDisplay: FileRepresentation[];
  @Input({ required: true }) selectedRegion!: string;
  @Input({ required: true }) annotationResources!: DspResource[];
  @Input({ required: true }) selectedTab!: number;

  @Output() tabChanged = new EventEmitter<MatTabChangeEvent>();

  protected readonly representationConstants = RepresentationConstants;

  resourceProperties: PropertyInfoValues[];
  loading = true;

  resourceClassLabel = (resource: DspResource): string => resource.res.entityInfo?.classes[resource.res.type].label;

  ngOnInit() {
    this.resourceProperties = this.resource.resProps
      .filter(prop => !prop.propDef['isLinkProperty'])
      .filter(prop => !prop.propDef.subPropertyOf.includes('http://api.knora.org/ontology/knora-api/v2#hasFileValue'));
  }

  trackAnnotationByFn = (index: number, item: DspResource) => `${index}-${item.res.id}`;
}
