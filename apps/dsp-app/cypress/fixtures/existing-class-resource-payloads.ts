import { MiscClass } from '../models/incunabula-data-models';

export class ExistingClassResourcePayloads {
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
    const key = `http://0.0.0.0:3333/ontology/0803/incunabula/v2#${className}HasColor`;
    return {
      [key]: {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#ColorValue',
        'http://api.knora.org/ontology/knora-api/v2#valueHasComment': comment,
        'http://api.knora.org/ontology/knora-api/v2#colorValueAsColor': value,
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
}
