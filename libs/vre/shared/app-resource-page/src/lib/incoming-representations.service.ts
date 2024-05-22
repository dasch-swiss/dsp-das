import { Inject, Injectable } from '@angular/core';
import {
  Constants,
  CountQueryResponse,
  KnoraApiConnection,
  ReadArchiveFileValue,
  ReadAudioFileValue,
  ReadDocumentFileValue,
  ReadFileValue,
  ReadMovingImageFileValue,
  ReadResource,
  ReadResourceSequence,
  ReadStillImageFileValue,
  ReadTextFileValue,
  SystemPropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { Common, DspCompoundPosition, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { IncomingService } from '@dasch-swiss/vre/shared/app-resource-properties';

@Injectable()
export class IncomingRepresentationsService {
  representationsToDisplay!: ReadFileValue;
  compoundPosition: DspCompoundPosition | undefined;
  resource!: DspResource;
  loading = false;
  incomingResource: DspResource | undefined;
  annotationResources: DspResource[];

  constructor(
    private _incomingService: IncomingService,
    private _notification: NotificationService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  onInit(resource: DspResource) {
    this.resource = resource;

    if (this._isObjectWithoutRepresentation(resource)) {
      this._checkForCompoundNavigation(resource);
      return;
    }

    this.representationsToDisplay = this._getFileValue(resource);

    if (this._isImageWithRegions(resource)) {
      this.getIncomingRegions(resource, 0);
    }
  }

  getIncomingRegions(resource: DspResource, offset: number): void {
    this._incomingService.getIncomingRegions(resource.res.id, offset).subscribe(regions => {
      Array.prototype.push.apply(resource.incomingAnnotations, (regions as ReadResourceSequence).resources);
    });
  }

  compoundNavigation(page: number) {
    this.representationsToDisplay = [];

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

  private _requestIncomingResources(resource: DspResource): void {
    // request incoming regions --> TODO: add case to get incoming sequences in case of video and audio
  }

  private _getIncomingStillImageRepresentations(offset: number): void {
    if (offset < 0 || offset > this.compoundPosition.maxOffsets) {
      this._notification.openSnackBar(`Offset of ${offset} is invalid`);
      return;
    }

    this._incomingService
      .getStillImageRepresentationsForCompoundResource(this.resource.res.id, offset)
      .subscribe((incomingImageRepresentations: ReadResourceSequence) => {
        if (incomingImageRepresentations.resources.length > 0) {
          // set the incoming representations for the current offset only
          this.resource.incomingRepresentations = incomingImageRepresentations.resources;
          this._getIncomingResource(this.resource.incomingRepresentations[this.compoundPosition.position].id);
        } else {
          this.loading = false;
          this.representationsToDisplay = [];
        }
      });
  }

  private _getIncomingResource(iri: string) {
    this._dspApiConnection.v2.res.getResource(iri).subscribe((response: ReadResource) => {
      this.incomingResource = new DspResource(response);
      this.incomingResource.resProps = Common.initProps(response)
        .filter(v => v.values.length > 0)
        .filter(v => v.propDef.id !== 'http://api.knora.org/ontology/knora-api/v2#hasStillImageFileValue');
      this.incomingResource.systemProps =
        this.incomingResource.res.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);

      this.representationsToDisplay = this._getFileValue(this.incomingResource);
      if (this.representationsToDisplay.length && this.representationsToDisplay[0].fileValue && this.compoundPosition) {
        this.getIncomingRegions(this.incomingResource, 0);
      }
    });
  }

  private _getFileValue(resource: DspResource) {
    if (resource.res.properties[Constants.HasStillImageFileValue]) {
      return resource.res.properties[Constants.HasStillImageFileValue][0] as ReadStillImageFileValue;
      /*
                                                      for (const img of fileValues) {
                                                        const regions: Region[] = [];

                                                        const annotations: DspResource[] = [];

                                                        for (const incomingRegion of resource.incomingAnnotations) {
                                                          const region = new Region(incomingRegion);
                                                          regions.push(region);

                                                          const annotation = new DspResource(incomingRegion);

                                                          // gather region property information
                                                          annotation.resProps = Common.initProps(incomingRegion).filter(v => v.values.length > 0);

                                                          // gather system property information
                                                          annotation.systemProps = incomingRegion.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);

                                                          this._actions$
                                                            .pipe(ofActionSuccessful(GetAttachedUserAction))
                                                            .pipe(take(1))
                                                            .subscribe(() => {
                                                              annotations.push(annotation);
                                                            });
                                                          this._store.dispatch(new GetAttachedUserAction(annotation.res.id, annotation.res.attachedToUser));
                                                        }

                                                        const stillImage = new FileRepresentation(img, regions);

                                                        representations.push(stillImage);

                                                        this.annotationResources = annotations;
                                                      }
                                                       */
    } else if (resource.res.properties[Constants.HasDocumentFileValue]) {
      return resource.res.properties[Constants.HasDocumentFileValue][0] as ReadDocumentFileValue;
    } else if (resource.res.properties[Constants.HasAudioFileValue]) {
      return resource.res.properties[Constants.HasAudioFileValue][0] as ReadAudioFileValue;
    } else if (resource.res.properties[Constants.HasMovingImageFileValue]) {
      return resource.res.properties[Constants.HasMovingImageFileValue][0] as ReadMovingImageFileValue;
    } else if (resource.res.properties[Constants.HasArchiveFileValue]) {
      return resource.res.properties[Constants.HasArchiveFileValue][0] as ReadArchiveFileValue;
    } else if (resource.res.properties[Constants.HasTextFileValue]) {
      return resource.res.properties[Constants.HasTextFileValue][0] as ReadTextFileValue;
    }

    throw new Error('The resource type is not recognized');
  }

  private _isImageWithRegions(resource: DspResource) {
    return resource.res.properties[Constants.HasStillImageFileValue] !== undefined;
  }

  private _isObjectWithoutRepresentation(resource: DspResource) {
    return [
      Constants.HasStillImageFileValue,
      Constants.HasMovingImageFileValue,
      Constants.HasAudioFileValue,
      Constants.HasTextFileValue,
      Constants.HasDocumentFileValue,
      Constants.HasArchiveFileValue,
    ].reduce((prev, current) => prev && !resource.res.properties[current], true);
  }

  private _checkForCompoundNavigation(resource: DspResource) {
    this._incomingService
      .getStillImageRepresentationsForCompoundResource(resource.res.id, 0, true)
      .subscribe(countQuery => {
        const countQuery_ = countQuery as CountQueryResponse;
        if (countQuery_.numberOfResults > 0) {
          this.compoundPosition = new DspCompoundPosition(countQuery_.numberOfResults);
          this.compoundNavigation(1);
        }
      });
  }
}
