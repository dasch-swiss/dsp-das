import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection, ReadResource, ReadResourceSequence, SystemPropertyDefinition } from '@dasch-swiss/dsp-js';
import { Common, DspCompoundPosition, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { IncomingService } from '@dasch-swiss/vre/shared/app-resource-properties';

@Injectable()
export class CompoundService {
  compoundPosition!: DspCompoundPosition;
  resource!: DspResource;
  incomingResource: DspResource | undefined;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _incomingService: IncomingService,
    private _notification: NotificationService
  ) {}

  onInit(_compound: DspCompoundPosition, resource: DspResource) {
    this.compoundPosition = _compound;
    this.resource = resource;
    this.openPage(1);
  }

  openPage(page: number) {
    // this.regionDrawMode = false;
    this.compoundNavigation(page);
  }

  compoundNavigation(page: number) {
    const offset = Math.ceil(page / 25) - 1;
    const position = Math.floor(page - offset * 25 - 1);

    // get incoming still image representations, if the offset changed
    if (offset !== this.compoundPosition.offset) {
      this.compoundPosition.offset = offset;
      this._getIncomingStillImageRepresentations(offset);
    } else {
      // get incoming resource, if the offset is the same but page changed
      this._getIncomingResource(this.resource.incomingRepresentations[position].id);
    }
    this.compoundPosition.position = position;
    this.compoundPosition.page = page;
  }

  private _getIncomingStillImageRepresentations(offset: number): void {
    if (offset < 0 || offset > this.compoundPosition.maxOffsets) {
      this._notification.openSnackBar(`Offset of ${offset} is invalid`);
      return;
    }

    this._incomingService
      .getStillImageRepresentationsForCompoundResource(this.resource.res.id, offset)
      .subscribe(res => {
        const incomingImageRepresentations = res as ReadResourceSequence;

        if (incomingImageRepresentations.resources.length === 0) {
          return;
        }
        this.resource.incomingRepresentations = incomingImageRepresentations.resources;
        this._getIncomingResource(this.resource.incomingRepresentations[this.compoundPosition.position].id);
      });
  }

  private _getIncomingResource(iri: string) {
    this._dspApiConnection.v2.res.getResource(iri).subscribe(res => {
      const response = res as ReadResource;

      this.incomingResource = new DspResource(response);
      this.incomingResource.resProps = Common.initProps(response)
        .filter(v => v.values.length > 0)
        .filter(v => v.propDef.id !== 'http://api.knora.org/ontology/knora-api/v2#hasStillImageFileValue');
      this.incomingResource.systemProps =
        this.incomingResource.res.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);
      /*
                                                                                                if (this.representationsToDisplay.length && this.representationsToDisplay[0].fileValue && this.compoundPosition) {
                                                                                                  this.getIncomingRegions(this.incomingResource, 0);
                                                                                                }
                                                                                                */
    });
  }
}
