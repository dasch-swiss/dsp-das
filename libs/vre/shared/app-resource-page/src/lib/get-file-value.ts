import {
  Constants,
  ReadArchiveFileValue,
  ReadAudioFileValue,
  ReadDocumentFileValue,
  ReadMovingImageFileValue,
  ReadStillImageFileValue,
  ReadTextFileValue,
} from '@dasch-swiss/dsp-js';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';

export function getFileValue(resource: DspResource) {
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
