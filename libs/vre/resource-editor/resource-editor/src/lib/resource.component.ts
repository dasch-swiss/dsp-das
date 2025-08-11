import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants, CountQueryResponse, KnoraApiConnection, ReadFileValue, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/core/config';
import { getFileValue, RegionService } from '@dasch-swiss/vre/resource-editor/representations';
import { SegmentsService } from '@dasch-swiss/vre/resource-editor/segment-support';
import { DspCompoundPosition, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { take } from 'rxjs';
import { CompoundService } from './compound/compound.service';

@Component({
  selector: 'app-resource',
  template: `
    <app-resource-restriction *ngIf="resource.res.userHasPermission === 'RV'" />
    <app-resource-header [resource]="resource" />
    <ng-container *ngIf="!resourceIsObjectWithoutRepresentation">
      <app-resource-legal [fileValue]="representationsToDisplay" />
      <app-resource-representation [resource]="resource" />
    </ng-container>
    <app-compound-viewer *ngIf="isCompoundNavigation" />
    <app-resource-tabs [resource]="resource" />
  `,
  providers: [CompoundService, RegionService, SegmentsService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;
  representationsToDisplay!: ReadFileValue;
  isCompoundNavigation!: boolean;
  resourceIsObjectWithoutRepresentation!: boolean;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _compoundService: CompoundService,
    @Inject(DspApiConnectionToken) private _dspApi: KnoraApiConnection,
    private _regionService: RegionService,
    private _route: ActivatedRoute
  ) {}

  ngOnChanges() {
    this._compoundService.reset();
    this.isCompoundNavigation = false;

    this.resourceIsObjectWithoutRepresentation = this._isObjectWithoutRepresentation(this.resource.res);
    this._onInit(this.resource.res);
  }

  private _onInit(resource: ReadResource) {
    if (this._isObjectWithoutRepresentation(resource)) {
      this._checkForCompoundNavigation(resource);
      return;
    }

    this.representationsToDisplay = getFileValue(resource)!;

    if (this._isStillImage(resource)) {
      this._regionService.initialize(resource.id);
      this._checkForAnnotationUri();
    }
  }

  private _isStillImage(resource: ReadResource) {
    return resource.properties[Constants.HasStillImageFileValue] !== undefined;
  }

  private _isObjectWithoutRepresentation(resource: ReadResource) {
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

  private _checkForCompoundNavigation(resource: ReadResource) {
    this._dspApi.v2.search
      .doSearchStillImageRepresentationsCount(resource.id)
      .pipe(take(1))
      .subscribe(countQuery => {
        const countQuery_ = countQuery as CountQueryResponse;
        this.isCompoundNavigation = countQuery_.numberOfResults > 0;
        if (this.isCompoundNavigation) {
          this._compoundService.onInit(new DspCompoundPosition(countQuery_.numberOfResults), this.resource);
          this._cdr.detectChanges();
        } else {
          this._compoundService.incomingResource.next(undefined);
        }
      });
  }
}
