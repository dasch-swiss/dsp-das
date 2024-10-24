import { AudioThingClass, Comment, DocumentClass, VideoThingClass } from '../models/existing-data-models';
import { ProjectAssertionPageBase } from './project-assertion-payloads';

export class Project0001ResourcePayloads extends ProjectAssertionPageBase {
  static readonly project = '0001';
  static readonly defaultOntology = 'anything';

  constructor() {
    super(Project0001ResourcePayloads.project, Project0001ResourcePayloads.defaultOntology);
  }

  private static label(className: string, value: string, ontology = Project0001ResourcePayloads.defaultOntology) {
    return {
      '@type': `http://0.0.0.0:3333/ontology/${Project0001ResourcePayloads.project}/${ontology}/v2#${className}`,
      'http://www.w3.org/2000/01/rdf-schema#label': value,
      'http://api.knora.org/ontology/knora-api/v2#attachedToProject': {
        '@id': `http://rdfh.ch/projects/${Project0001ResourcePayloads.project}`,
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

  private static propertySegment(
    propertyName: string,
    textValues: Comment[],
    ontology = Project0001ResourcePayloads.defaultOntology
  ) {
    return {
      [`http://0.0.0.0:3333/ontology/${Project0001ResourcePayloads.project}/${ontology}/v2#${propertyName}`]: [
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
