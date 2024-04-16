const short = (label: string, lastModificationDate: string) => {
  return {
    '@id': 'http://0.0.0.0:3333/ontology/00FF/images/v2',
    '@type': 'http://www.w3.org/2002/07/owl#Ontology',
    'http://api.knora.org/ontology/knora-api/v2#lastModificationDate': {
      '@type': 'http://www.w3.org/2001/XMLSchema#dateTimeStamp',
      '@value': lastModificationDate,
    },
    '@graph': [
      {
        'http://api.knora.org/ontology/knora-api/v2#objectType': {
          '@id': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
        },
        'http://www.w3.org/2000/01/rdf-schema#label': {
          '@language': 'de',
          '@value': 'property',
        },
        'http://www.w3.org/2000/01/rdf-schema#comment': {
          '@language': 'de',
          '@value': 'property',
        },
        'http://www.w3.org/2000/01/rdf-schema#subPropertyOf': {
          '@id': 'http://api.knora.org/ontology/knora-api/v2#hasValue',
        },
        'http://api.knora.org/ontology/salsah-gui/v2#guiElement': {
          '@id': 'http://api.knora.org/ontology/salsah-gui/v2#SimpleText',
        },
        '@id': 'http://0.0.0.0:3333/ontology/00FF/images/v2#property',
        '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      },
    ],
  };
};

const cardinality = (propertyId: string, lastModificationDate: string) => {
  return {
    '@id': 'http://0.0.0.0:3333/ontology/00FF/images/v2',
    '@type': 'http://www.w3.org/2002/07/owl#Ontology',
    'http://api.knora.org/ontology/knora-api/v2#lastModificationDate': {
      '@type': 'http://www.w3.org/2001/XMLSchema#dateTimeStamp',
      '@value': lastModificationDate,
    },
    '@graph': [
      {
        '@id': 'http://0.0.0.0:3333/ontology/00FF/images/v2#datamodelclass',
        '@type': 'http://www.w3.org/2002/07/owl#Class',
        'http://www.w3.org/2000/01/rdf-schema#subClassOf': {
          '@type': 'http://www.w3.org/2002/07/owl#Restriction',
          'http://www.w3.org/2002/07/owl#onProperty': {
            '@id': 'http://0.0.0.0:3333/ontology/00FF/images/v2#property',
          },
          'http://www.w3.org/2002/07/owl#maxCardinality': 1,
          'http://api.knora.org/ontology/salsah-gui/v2#guiOrder': 1,
        },
      },
    ],
  };
};

const lastModificationDate = response => response.body['knora-api:lastModificationDate']['@value'];
describe('Resource', () => {
  let listUrl: string;
  let listId: string;
  beforeEach(() => {
    console.log('start of test');
    cy.request('POST', `${Cypress.env('apiUrl')}/v2/ontologies/classes`, {
      '@id': 'http://0.0.0.0:3333/ontology/00FF/images/v2',
      '@type': 'http://www.w3.org/2002/07/owl#Ontology',
      'http://api.knora.org/ontology/knora-api/v2#lastModificationDate': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTimeStamp',
        '@value': '2012-12-12T12:12:12.120Z',
      },
      '@graph': [
        {
          '@type': 'http://www.w3.org/2002/07/owl#Class',
          'http://www.w3.org/2000/01/rdf-schema#label': { '@language': 'de', '@value': 'datamodelclass' },
          'http://www.w3.org/2000/01/rdf-schema#comment': { '@language': 'de', '@value': 'datamodelclass' },
          'http://www.w3.org/2000/01/rdf-schema#subClassOf': {
            '@id': 'http://api.knora.org/ontology/knora-api/v2#Resource',
          },
          '@id': 'http://0.0.0.0:3333/ontology/00FF/images/v2#datamodelclass',
        },
      ],
    })
      .then(response => {
        cy.request(
          'POST',
          `${Cypress.env('apiUrl')}/v2/ontologies/properties`,
          short('v', lastModificationDate(response))
        );
      })
      .then(response => {
        console.log('received', response);
        cy.request(
          'POST',
          `${Cypress.env('apiUrl')}/v2/ontologies/cardinalities`,
          cardinality('yolo2', lastModificationDate(response))
        );
      });
  });
  it('test', () => {
    console.log('coucou');
  });
});
