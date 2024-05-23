import { Injectable } from '@angular/core';
import { Constants, CountQueryResponse, ReadFileValue } from '@dasch-swiss/dsp-js';
import { DspCompoundPosition, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { RegionService } from '@dasch-swiss/vre/shared/app-representations';
import { IncomingService } from '@dasch-swiss/vre/shared/app-resource-properties';
import { CompoundService } from './compound/compound.service';
import { getFileValue } from './get-file-value';

@Injectable()
export class ResourcePageService {
  representationsToDisplay!: ReadFileValue;
  isCompoundNavigation: boolean | null = null;
  resource!: DspResource;

  constructor(
    private _incomingService: IncomingService,
    private _compoundService: CompoundService,
    private _regionService: RegionService
  ) {}

  onInit(resource: DspResource) {
    this.resource = resource;

    if (this._isObjectWithoutRepresentation(resource)) {
      this._checkForCompoundNavigation(resource);
      return;
    }

    this.isCompoundNavigation = false;
    this.representationsToDisplay = getFileValue(resource)!;

    if (this._isImageWithRegions(resource)) {
      this._regionService.onInit(resource);
    }
  }

  pageIsLoaded() {
    return (
      this.isCompoundNavigation === false ||
      (this.isCompoundNavigation === true && this._compoundService.incomingResource !== undefined)
    );
  }

  private _isImageWithRegions(resource: DspResource) {
    return resource.res.properties[Constants.HasStillImageFileValue] !== undefined;
  }

  private _isObjectWithoutRepresentation(resource: DspResource) {
    return getFileValue(resource) === null;
  }

  private _checkForCompoundNavigation(resource: DspResource) {
    this._incomingService
      .getStillImageRepresentationsForCompoundResource(resource.res.id, 0, true)
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
