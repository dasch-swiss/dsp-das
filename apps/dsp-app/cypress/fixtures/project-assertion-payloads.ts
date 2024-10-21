export class ProjectAssertionPageBase {
  projectShortCode: string;
  ontologyName: string;

  constructor(projectShortCode: string, ontologyName: string) {
    this.projectShortCode = projectShortCode;
    this.ontologyName = ontologyName;
  }

  createClassPayload = (value, subClassOf: string = 'http://api.knora.org/ontology/knora-api/v2#Resource') => {
    return {
      '@id': `http://0.0.0.0:3333/ontology/${this.projectShortCode}/${this.ontologyName}/v2`,
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
          '@id': `http://0.0.0.0:3333/ontology/${this.projectShortCode}/${this.ontologyName}/v2#${value}`,
        },
      ],
    };
  };

  stillImageRepresentation = () => {
    return this.createClassPayload('http://api.knora.org/ontology/knora-api/v2#StillImageRepresentation');
  };
}
