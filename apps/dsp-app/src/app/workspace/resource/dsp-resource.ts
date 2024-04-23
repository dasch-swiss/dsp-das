import {
  Constants,
  IHasPropertyWithPropertyDefinition,
  ReadArchiveFileValue,
  ReadAudioFileValue,
  ReadDocumentFileValue,
  ReadLinkValue,
  ReadMovingImageFileValue,
  ReadResource,
  ReadStillImageFileValue,
  ReadTextFileValue,
  ReadValue,
  SystemPropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from './properties/properties.component';

export type ReadFileValueType =
  | ReadAudioFileValue
  | ReadDocumentFileValue
  | ReadMovingImageFileValue
  | ReadStillImageFileValue
  | ReadArchiveFileValue
  | ReadTextFileValue;

export class DspResource extends ReadResource {
  incomingAnnotations: ReadResource[] = []; // Todo delete this property

  constructor(resource: ReadResource) {
    super();
    Object.assign(this, resource);
  }

  get systemProps(): SystemPropertyDefinition[] {
    return this.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);
  }

  get resProps(): PropertyInfoValues[] {
    const props = this.entityInfo.classes[this.type]
      .getResourcePropertiesList()
      .map((prop: IHasPropertyWithPropertyDefinition) => {
        // the object type is none from above
        return {
          propDef: prop.propertyDefinition,
          guiDef: prop,
          values: this.getValues(prop.propertyIndex),
        };
      });

    // sort properties by guiOrder
    return (
      props
        .filter(prop => prop.propDef.objectType !== Constants.GeomValue)
        .sort((a, b) => (a.guiDef.guiOrder > b.guiDef.guiOrder ? 1 : -1))
        // eslint-disable-next-line array-callback-return
        .sort(a => {
          if (a.guiDef.guiOrder === undefined) {
            return 1;
          }
        })
    );
  }

  get hasRegion(): boolean {
    return !!this.entityInfo.classes[Constants.Region];
  }

  get hasOutgoingReferences(): boolean {
    return this.outgoingReferences.length > 0;
  }

  get isRegionOf(): ReadLinkValue {
    return (this.properties[Constants.IsRegionOfValue] as ReadLinkValue[])[0];
  }

  get stillImageRepresentations(): ReadStillImageFileValue[] {
    return this.getFileRepresentations<ReadStillImageFileValue>(Constants.HasStillImageFileValue);
  }

  get documentRepresentations(): ReadDocumentFileValue[] {
    return this.getFileRepresentations<ReadDocumentFileValue>(Constants.HasDocumentFileValue);
  }

  get audioRepresentations(): ReadAudioFileValue[] {
    return this.getFileRepresentations<ReadAudioFileValue>(Constants.HasAudioFileValue);
  }

  get movingImageRepresentations(): ReadMovingImageFileValue[] {
    return this.getFileRepresentations<ReadMovingImageFileValue>(Constants.HasMovingImageFileValue);
  }

  get archiveRepresentations(): ReadArchiveFileValue[] {
    return this.getFileRepresentations<ReadArchiveFileValue>(Constants.HasArchiveFileValue);
  }

  get textFileRepresentations(): ReadTextFileValue[] {
    return this.getFileRepresentations<ReadTextFileValue>(Constants.HasTextFileValue);
  }

  get readFileValueType(): ReadFileValueType {
    if (this.stillImageRepresentations.length > 0) {
      return this.stillImageRepresentations[0];
    } else if (this.documentRepresentations.length > 0) {
      return this.documentRepresentations[0];
    } else if (this.audioRepresentations.length > 0) {
      return this.audioRepresentations[0];
    } else if (this.movingImageRepresentations.length > 0) {
      return this.movingImageRepresentations[0];
    } else if (this.archiveRepresentations.length > 0) {
      return this.archiveRepresentations[0];
    } else if (this.textFileRepresentations.length > 0) {
      return this.textFileRepresentations[0];
    }
    return null;
  }

  private getFileRepresentations<T extends ReadFileValueType>(propertyKey: string): T[] {
    return (this.properties[propertyKey] as T[]) || [];
  }
}

export class DspCompoundPosition {
  offset: number; // current offset of search requests
  maxOffsets: number; // max offsets in relation to totalPages
  position: number; // current item position in offset sequence
  page: number; // current and real page number in compound object
  totalPages: number; // total pages (part of) in compound object

  constructor(totalPages: number) {
    this.totalPages = totalPages;
    this.maxOffsets = Math.ceil(totalPages / 25) - 1;
  }
}

export interface PropIriToNameMapping {
  [index: string]: string;
}

export interface PropertyValues {
  [index: string]: ReadValue[];
}
