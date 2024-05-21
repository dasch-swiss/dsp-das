import { Inject, Injectable } from '@angular/core';
import {
  Constants,
  CountQueryResponse,
  KnoraApiConnection,
  ReadArchiveFileValue,
  ReadAudioFileValue,
  ReadDocumentFileValue,
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
import { GetAttachedUserAction } from '@dasch-swiss/vre/shared/app-state';
import { FileRepresentation } from '@dsp-app/src/app/workspace/resource/representation/file-representation';
import { Region } from '@dsp-app/src/app/workspace/resource/representation/still-image/still-image.component';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { take } from 'rxjs/operators';

@Injectable()
export class IncomingRepresentationsService {
  representationsToDisplay: FileRepresentation[] = [];
  compoundPosition: DspCompoundPosition | undefined;
  resource: DspResource;
  loading = false;
  incomingResource: DspResource | undefined;
  annotationResources: DspResource[];

  constructor(
    private _incomingService: IncomingService,
    private _notification: NotificationService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _store: Store,
    private _actions$: Actions
  ) {}

  onInit(resource: DspResource) {
    this.resource = resource;
    const representationsToDisplay = this._collectRepresentationsAndAnnotations(resource);

    if (this._isImageWithRegions(resource, representationsToDisplay)) {
      this.getIncomingRegions(resource, 0);
      return;
    }

    if (this._isObjectWithoutRepresentation(resource)) {
      this._incomingService
        .getStillImageRepresentationsForCompoundResource(resource.res.id, 0, true)
        .subscribe((countQuery: CountQueryResponse) => {
          if (countQuery.numberOfResults > 0) {
            this.compoundPosition = new DspCompoundPosition(countQuery.numberOfResults);
            this.compoundNavigation(1);
          }
        });
    }
  }

  getIncomingRegions(resource: DspResource, offset: number): void {
    this._incomingService.getIncomingRegions(resource.res.id, offset).subscribe((regions: ReadResourceSequence) => {
      Array.prototype.push.apply(resource.incomingAnnotations, regions.resources);
      this.representationsToDisplay = this._collectRepresentationsAndAnnotations(resource);
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

      this.representationsToDisplay = this._collectRepresentationsAndAnnotations(this.incomingResource);
      if (this.representationsToDisplay.length && this.representationsToDisplay[0].fileValue && this.compoundPosition) {
        this.getIncomingRegions(this.incomingResource, 0);
      }
    });
  }

  private _collectRepresentationsAndAnnotations(resource: DspResource): FileRepresentation[] {
    if (!resource) {
      return;
    }

    // general object for all kind of representations
    const representations: FileRepresentation[] = [];

    // --> TODO: use proper classes and a factory
    if (resource.res.properties[Constants.HasStillImageFileValue]) {
      // --> TODO: check if resources is a StillImageRepresentation using the ontology responder (support for subclass relations required)
      // resource has StillImageFileValues that are directly attached to it (properties)

      const fileValues: ReadStillImageFileValue[] = resource.res.properties[
        Constants.HasStillImageFileValue
      ] as ReadStillImageFileValue[];
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
    } else if (resource.res.properties[Constants.HasDocumentFileValue]) {
      const fileValues: ReadDocumentFileValue[] = resource.res.properties[
        Constants.HasDocumentFileValue
      ] as ReadDocumentFileValue[];
      for (const doc of fileValues) {
        const document = new FileRepresentation(doc);
        representations.push(document);
      }
    } else if (resource.res.properties[Constants.HasAudioFileValue]) {
      const fileValue: ReadAudioFileValue = resource.res.properties[
        Constants.HasAudioFileValue
      ][0] as ReadAudioFileValue;
      const audio = new FileRepresentation(fileValue);
      representations.push(audio);
    } else if (resource.res.properties[Constants.HasMovingImageFileValue]) {
      const fileValue: ReadMovingImageFileValue = resource.res.properties[
        Constants.HasMovingImageFileValue
      ][0] as ReadMovingImageFileValue;
      const video = new FileRepresentation(fileValue);
      representations.push(video);
    } else if (resource.res.properties[Constants.HasArchiveFileValue]) {
      const fileValue: ReadArchiveFileValue = resource.res.properties[
        Constants.HasArchiveFileValue
      ][0] as ReadArchiveFileValue;
      const archive = new FileRepresentation(fileValue);
      representations.push(archive);
    } else if (resource.res.properties[Constants.HasTextFileValue]) {
      const fileValue: ReadTextFileValue = resource.res.properties[Constants.HasTextFileValue][0] as ReadTextFileValue;
      const text = new FileRepresentation(fileValue);
      representations.push(text);
    }
    return representations;
  }

  private _isImageWithRegions(resource: DspResource, representations: FileRepresentation[]) {
    return resource.res.properties[Constants.HasStillImageFileValue] && representations.length > 0;
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
}
