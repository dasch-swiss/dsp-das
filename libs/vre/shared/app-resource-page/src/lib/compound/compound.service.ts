import { ChangeDetectorRef, Inject, Injectable } from '@angular/core';
import { KnoraApiConnection, ReadResource, ReadResourceSequence, SystemPropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspCompoundPosition, DspResource, GenerateProperty } from '@dasch-swiss/vre/shared/app-common';
import { IncomingService } from '@dasch-swiss/vre/shared/app-common-to-move';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppError } from '@dasch-swiss/vre/shared/app-error-handler';
import { RegionService } from '@dasch-swiss/vre/shared/app-representations';
import { Subject } from 'rxjs';

@Injectable()
export class CompoundService {
  compoundPosition?: DspCompoundPosition;
  incomingResource?: DspResource;
  resource!: DspResource;

  onOpenNotLoadedIncomingResourcePage$: Subject<void> = new Subject<void>();

  get exists() {
    return this.compoundPosition !== undefined;
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _incomingService: IncomingService,
    private _regionService: RegionService,
    private _cd: ChangeDetectorRef
  ) {}

  onInit(_compound: DspCompoundPosition, resource: DspResource) {
    this.compoundPosition = _compound;
    this.resource = resource;
    this.openPage(_compound.page);
  }

  openPage(page: number) {
    if (!this.compoundPosition) {
      throw new AppError('Compound position is not set');
    }

    const offset = Math.ceil(page / 25) - 1;
    const position = Math.floor(page - offset * 25 - 1);

    if (offset === this.compoundPosition.offset && this.resource.incomingRepresentations.length > 0) {
      if (this.resource.incomingRepresentations[position]) {
        this._loadIncomingResource(this.resource.incomingRepresentations[position].id);
      } else {
        this.onOpenNotLoadedIncomingResourcePage$.next();
      }
    } else {
      this.compoundPosition.offset = offset;
      this._loadIncomingResourcesPage(this.compoundPosition, offset);
    }

    this.compoundPosition.position = position;
    this.compoundPosition.page = page;
  }

  private _loadIncomingResourcesPage(compoundPosition: DspCompoundPosition, offset: number): void {
    if (offset < 0 || offset > compoundPosition.maxOffsets) {
      throw new AppError(`Offset of ${offset} is invalid`);
    }

    this._incomingService
      .getStillImageRepresentationsForCompoundResource(this.resource.res.id, offset)
      .subscribe(res => {
        const incomingImageRepresentations = res as ReadResourceSequence;

        if (incomingImageRepresentations.resources.length === 0) {
          return;
        }
        this.resource.incomingRepresentations = incomingImageRepresentations.resources;
        this._loadIncomingResource(this.resource.incomingRepresentations[compoundPosition.position].id);
      });
  }

  private _loadIncomingResource(iri: string) {
    this._dspApiConnection.v2.res.getResource(iri).subscribe(res => {
      const response = res as ReadResource;

      const incomingResource = new DspResource(response);
      incomingResource.resProps = GenerateProperty.incomingRessourceProperty(response);
      incomingResource.systemProps =
        incomingResource.res.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);

      this.incomingResource = incomingResource;
      this._regionService.onInit(incomingResource);
      this._cd.markForCheck();
    });
  }
}
