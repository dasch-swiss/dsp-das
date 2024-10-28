import { Component, Input, OnInit } from '@angular/core';
import { Constants, CountQueryResponse, ReadFileValue } from '@dasch-swiss/dsp-js';
import { DspCompoundPosition, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IncomingService } from '@dasch-swiss/vre/shared/app-common-to-move';
import { getFileValue, RegionService } from '@dasch-swiss/vre/shared/app-representations';
import { SegmentsService } from '@dasch-swiss/vre/shared/app-segment-support';
import { take } from 'rxjs/operators';
import { CompoundService } from './compound/compound.service';

@Component({
  selector: 'app-resource',
  template: `
    <app-resource-restriction *ngIf="resource.res.userHasPermission === 'RV'" />

    <div class=" content large middle">
      <div class="resource-view">
        <app-resource-header [resource]="resource" />

        <ng-container *ngIf="isCompoundNavigation === false; else compoundViewerTpl">
          <app-resource-representation [resource]="resource" *ngIf="!resourceIsObjectWithoutRepresentation" />
        </ng-container>

        <dasch-swiss-app-progress-indicator *ngIf="!pageIsLoaded()" />

        <app-resource-tabs [resource]="resource" />
      </div>
    </div>

    <ng-template #compoundViewerTpl>
      <app-compound-viewer />
    </ng-template>
  `,
  styleUrls: ['./resource.component.scss'],
  providers: [CompoundService, RegionService, SegmentsService],
})
export class ResourceComponent implements OnInit {
  @Input({ required: true }) resource!: DspResource;
  representationsToDisplay!: ReadFileValue;
  isCompoundNavigation: boolean | null = null;
  resourceIsObjectWithoutRepresentation!: boolean;

  constructor(
    private _incomingService: IncomingService,
    private _compoundService: CompoundService,
    private _regionService: RegionService
  ) {}

  ngOnInit() {
    this.resourceIsObjectWithoutRepresentation = getFileValue(this.resource) === null;
    this._onInit(this.resource);
  }

  pageIsLoaded() {
    return (
      this.isCompoundNavigation === false ||
      (this.isCompoundNavigation === true && this._compoundService.incomingResource !== undefined)
    );
  }

  private _onInit(resource: DspResource) {
    if (this._isObjectWithoutRepresentation(resource)) {
      this._checkForCompoundNavigation(resource);
      return;
    }

    this.isCompoundNavigation = false;
    this.representationsToDisplay = getFileValue(resource)!;

    if (this._isStillImage(resource)) {
      this._regionService.onInit(resource);
    }
  }

  private _isStillImage(resource: DspResource) {
    return resource.res.properties[Constants.HasStillImageFileValue] !== undefined;
  }

  private _isObjectWithoutRepresentation(resource: DspResource) {
    return getFileValue(resource) === null;
  }

  private _checkForCompoundNavigation(resource: DspResource) {
    this._incomingService
      .getStillImageRepresentationsForCompoundResource(resource.res.id, 0, true)
      .pipe(take(1))
      .subscribe(countQuery => {
        const countQuery_ = countQuery as CountQueryResponse;

        if (countQuery_.numberOfResults > 0) {
          this.isCompoundNavigation = true;

          this._compoundService.onInit(new DspCompoundPosition(countQuery_.numberOfResults), this.resource);
          return;
        }

        this.isCompoundNavigation = false;
      });
  }
}
