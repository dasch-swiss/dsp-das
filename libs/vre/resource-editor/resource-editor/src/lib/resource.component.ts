import { ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants, CountQueryResponse, ReadFileValue, ReadResource } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { getFileValue, RegionService } from '@dasch-swiss/vre/resource-editor/representations';
import { SegmentsService } from '@dasch-swiss/vre/resource-editor/segment-support';
import { DspCompoundPosition, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IncomingService } from '@dasch-swiss/vre/shared/app-common-to-move';
import { take } from 'rxjs/operators';
import { CompoundService } from './compound/compound.service';

@Component({
  selector: 'app-resource',
  template: `
    <app-resource-restriction *ngIf="resource.res.userHasPermission === 'RV'" />

    <div class="content large middle">
      <div>
        <app-resource-header [resource]="resource" />
        <app-resource-representation [resource]="resource" *ngIf="!resourceIsObjectWithoutRepresentation" />
        <app-compound-viewer *ngIf="isCompoundNavigation" />
        <app-resource-tabs [resource]="resource" />
      </div>
    </div>
  `,
  providers: [CompoundService, RegionService, SegmentsService],
})
export class ResourceComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;
  representationsToDisplay!: ReadFileValue;
  isCompoundNavigation!: boolean;
  resourceIsObjectWithoutRepresentation!: boolean;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _incomingService: IncomingService,
    private _compoundService: CompoundService,
    private _regionService: RegionService,
    private _route: ActivatedRoute
  ) {}

  ngOnChanges() {
    this._compoundService.reset();
    this.isCompoundNavigation = false;

    this.resourceIsObjectWithoutRepresentation = this._isObjectWithoutRepresentation(this.resource.res);
    this._onInit(this.resource);
  }

  private _onInit(resource: DspResource) {
    if (this._isObjectWithoutRepresentation(resource.res)) {
      this._checkForCompoundNavigation(resource);
      return;
    }

    this.representationsToDisplay = getFileValue(resource.res)!;

    if (this._isStillImage(resource.res)) {
      this._regionService.initialize(resource.res.id);
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

  private _checkForCompoundNavigation(resource: DspResource) {
    this._incomingService
      .getStillImageRepresentationsForCompoundResource(resource.res.id, 0, true)
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
