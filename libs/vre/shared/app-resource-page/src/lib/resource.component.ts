import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants, CountQueryResponse, ReadFileValue } from '@dasch-swiss/dsp-js';
import { DspCompoundPosition, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IncomingService } from '@dasch-swiss/vre/shared/app-common-to-move';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { RegionService, getFileValue } from '@dasch-swiss/vre/shared/app-representations';
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

        <ng-container *ngIf="!isCompoundNavigation; else compoundViewerTpl">
          <app-resource-representation [resource]="resource" *ngIf="!resourceIsObjectWithoutRepresentation" />
        </ng-container>

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
  @Input({ required: true }) isDifferentResource!: boolean;
  representationsToDisplay!: ReadFileValue;
  isCompoundNavigation: boolean = false;
  resourceIsObjectWithoutRepresentation!: boolean;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _incomingService: IncomingService,
    private _compoundService: CompoundService,
    private _regionService: RegionService,
    private _route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.resourceIsObjectWithoutRepresentation = this._isObjectWithoutRepresentation(this.resource);
    this._onInit(this.resource, this.isDifferentResource);
  }

  private _onInit(resource: DspResource, isDifferentResource: boolean) {
    if (this._isObjectWithoutRepresentation(resource)) {
      this._checkForCompoundNavigation(resource, isDifferentResource);
      return;
    }

    this.representationsToDisplay = getFileValue(resource)!;

    if (this._isStillImage(resource)) {
      this._regionService.initialize(resource.res.id);
      this._checkForAnnotationUri();
    }
  }

  private _isStillImage(resource: DspResource) {
    return resource.res.properties[Constants.HasStillImageFileValue] !== undefined;
  }

  private _isObjectWithoutRepresentation(resource: DspResource) {
    return getFileValue(resource) === null;
  }

  private _checkForAnnotationUri() {
    const annotation = this._route.snapshot.queryParamMap.get(RouteConstants.annotationQueryParam);
    if (!annotation) {
      return;
    }

    this._regionService.showRegions(true);
    this._regionService.selectRegion(annotation);
  }

  private _checkForCompoundNavigation(resource: DspResource, isDifferentResource: boolean) {
    this._incomingService
      .getStillImageRepresentationsForCompoundResource(resource.res.id, 0, true)
      .pipe(take(1))
      .subscribe(countQuery => {
        const countQuery_ = countQuery as CountQueryResponse;

        if (countQuery_.numberOfResults > 0) {
          this.isCompoundNavigation = true;
          this._cdr.detectChanges();
          this._compoundService.onInit(
            this._compoundService.exists && !isDifferentResource
              ? this._compoundService.compoundPosition!
              : new DspCompoundPosition(countQuery_.numberOfResults),
            this.resource
          );
        }
      });
  }
}
