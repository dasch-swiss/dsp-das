import { AudioThingClass, Comment, DocumentClass, VideoThingClass } from '../models/existing-data-models';

export class Project0001ResourcePayloads {
  private static label(className: string, value: string) {
    return {
      '@type': `http://0.0.0.0:3333/ontology/0001/anything/v2#${className}`,
      'http://www.w3.org/2000/01/rdf-schema#label': value,
      'http://api.knora.org/ontology/knora-api/v2#attachedToProject': {
        '@id': 'http://rdfh.ch/projects/0001',
      },
    };
  }

  private static textValueSegment(value: string, comment: string) {
    return {
      '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
      'http://api.knora.org/ontology/knora-api/v2#valueHasComment': comment,
      'http://api.knora.org/ontology/knora-api/v2#valueAsString': value,
    };
  }

  private static propertySegment(propertyName: string, textValues: Comment[]) {
    return {
      [`http://0.0.0.0:3333/ontology/0001/anything/v2#${propertyName}`]: [
        ...textValues.map(textValue => {
          return { ...this.textValueSegment(textValue.text, textValue.comment) };
        }),
      ],
    };
  }

  private static movingImage(value: string) {
    return {
      [`http://api.knora.org/ontology/knora-api/v2#hasMovingImageFileValue`]: {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#MovingImageFileValue',
        'http://api.knora.org/ontology/knora-api/v2#fileValueHasFilename': value,
      },
    };
  }

  private static audioSegment(value: string) {
    return {
      [`http://api.knora.org/ontology/knora-api/v2#hasAudioFileValue`]: {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#AudioFileValue',
        'http://api.knora.org/ontology/knora-api/v2#fileValueHasFilename': value,
      },
    };
  }

  private static documentSegment(value: string) {
    return {
      [`http://api.knora.org/ontology/knora-api/v2#hasDocumentFileValue`]: {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#DocumentFileValue',
        'http://api.knora.org/ontology/knora-api/v2#fileValueHasFilename': value,
      },
    };
  }

  static videoThing(data: VideoThingClass) {
    const className = 'VideoThing';
    const request = {
      ...this.label(className, data.label),
      ...this.propertySegment('hasTitle', [{ text: data.title, comment: data.titleComment }]),
      ...this.movingImage(data.file),
    };
    return request;
  }

  static audioThing(data: AudioThingClass) {
    const className = 'AudioThing';
    const request = {
      ...this.label(className, data.label),
      ...this.propertySegment('hasTitle', [{ text: data.title, comment: data.titleComment }]),
      ...this.audioSegment(data.file),
    };
    return request;
  }

  static document(data: DocumentClass) {
    const className = 'ThingDocument';
    const request = {
      ...this.label(className, data.label),
      ...this.propertySegment('hasDocumentTitle', [
        {
          text: data.titleComments[0].text,
          comment: data.titleComments[0].comment,
        },
        {
          text: data.titleComments[1].text,
          comment: data.titleComments[1].comment,
        },
      ]),
      ...this.documentSegment(data.file),
    };
    return request;
  }
}
