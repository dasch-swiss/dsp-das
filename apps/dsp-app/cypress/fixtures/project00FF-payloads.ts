import { ArchiveClass } from '../models/existing-data-models';

export class Project00FFPayloads {
  static readonly project = '00FF';
  static readonly defaultOntology = 'images';

  static createClassPayload = (value, subClassOf: string = 'http://api.knora.org/ontology/knora-api/v2#Resource') => {
    return {
      '@id': `http://0.0.0.0:3333/ontology/${Project00FFPayloads.project}/${Project00FFPayloads.defaultOntology}/v2`,
      '@type': 'http://www.w3.org/2002/07/owl#Ontology',
      'http://api.knora.org/ontology/knora-api/v2#lastModificationDate': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTimeStamp',
        '@value': '2012-12-12T12:12:12.120Z',
      },
      '@graph': [
        {
          '@type': 'http://www.w3.org/2002/07/owl#Class',
          'http://www.w3.org/2000/01/rdf-schema#label': { '@language': 'de', '@value': value },
          'http://www.w3.org/2000/01/rdf-schema#comment': { '@language': 'de', '@value': value },
          'http://www.w3.org/2000/01/rdf-schema#subClassOf': {
            '@id': subClassOf,
          },
          '@id': `http://0.0.0.0:3333/ontology/${Project00FFPayloads.project}/${Project00FFPayloads.defaultOntology}/v2#${value}`,
        },
      ],
    };
  };

  static stillImageRepresentation = () => {
    return Project00FFPayloads.createClassPayload(
      'http://api.knora.org/ontology/knora-api/v2#StillImageRepresentation'
    );
  };

  private static label(className: string, value: string, ontology = Project00FFPayloads.defaultOntology) {
    return {
      '@type': `http://0.0.0.0:3333/ontology/${Project00FFPayloads.project}/${ontology}/v2#${className}`,
      'http://www.w3.org/2000/01/rdf-schema#label': value,
      'http://api.knora.org/ontology/knora-api/v2#attachedToProject': {
        '@id': `http://rdfh.ch/projects/${Project00FFPayloads.project}`,
      },
    };
  }

  private static archiveSegment(value: string) {
    return {
      [`http://api.knora.org/ontology/knora-api/v2#hasArchiveFileValue`]: {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#ArchiveFileValue',
        'http://api.knora.org/ontology/knora-api/v2#fileValueHasFilename': value,
      },
    };
  }

  static archive(data: ArchiveClass) {
    const request = {
      ...this.label(data.className, data.label),
      ...this.archiveSegment(data.file),
    };
    return request;
  }
}
