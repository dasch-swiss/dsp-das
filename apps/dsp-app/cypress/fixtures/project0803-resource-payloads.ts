import { MiscClass, SidebandClass } from '../models/existing-data-models';

export class Project0803ResourcePayloads {
  private static label(className: string, value: string) {
    return {
      '@type': `http://0.0.0.0:3333/ontology/0803/incunabula/v2#${className}`,
      'http://www.w3.org/2000/01/rdf-schema#label': value,
      'http://api.knora.org/ontology/knora-api/v2#attachedToProject': {
        '@id': 'http://rdfh.ch/projects/0803',
      },
    };
  }

  private static hasColor(className: string, value: string, comment: string) {
    return {
      [`http://0.0.0.0:3333/ontology/0803/incunabula/v2#${className}HasColor`]: {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#ColorValue',
        'http://api.knora.org/ontology/knora-api/v2#valueHasComment': comment,
        'http://api.knora.org/ontology/knora-api/v2#colorValueAsColor': value,
      },
    };
  }

  private static textValue(propertyName: string, value: string, comment: string) {
    return {
      [`http://0.0.0.0:3333/ontology/0803/incunabula/v2#${propertyName}`]: {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
        'http://api.knora.org/ontology/knora-api/v2#valueHasComment': comment,
        'http://api.knora.org/ontology/knora-api/v2#valueAsString': value,
      },
    };
  }

  private static richTextValue(propertyName: string, value: string, comment: string) {
    return {
      [`http://0.0.0.0:3333/ontology/0803/incunabula/v2#${propertyName}`]: {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
        'http://api.knora.org/ontology/knora-api/v2#valueHasComment': comment,
        'http://api.knora.org/ontology/knora-api/v2#textValueAsXml': `<?xml version=\"1.0\" encoding=\"UTF-8\"?><text><p>${value}</p></text>`,
        'http://api.knora.org/ontology/knora-api/v2#textValueHasMapping': {
          '@id': 'http://rdfh.ch/standoff/mappings/StandardMapping',
        },
      },
    };
  }

  private static stillImage(value: string) {
    return {
      [`http://api.knora.org/ontology/knora-api/v2#hasStillImageFileValue`]: {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#StillImageFileValue',
        'http://api.knora.org/ontology/knora-api/v2#fileValueHasFilename': value,
      },
    };
  }

  static misc(data: MiscClass) {
    const className = 'misc';
    const request = {
      ...this.label(className, data.label),
      ...this.hasColor(className, data.color, data.colorComment),
    };
    return request;
  }

  static sideband(data: SidebandClass) {
    const className = 'Sideband';
    const request = {
      ...this.label(className, data.label),
      ...this.textValue('sbTitle', data.title, data.titleComment),
      ...this.stillImage(data.file),
      ...this.richTextValue('description', data.description, data.descriptionComment),
      ...this.richTextValue('sideband_comment', data.comments[0].text, data.comments[0].comment),
    };
    return request;
  }
}
