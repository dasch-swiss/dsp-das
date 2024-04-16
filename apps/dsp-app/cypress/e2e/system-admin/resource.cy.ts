import { faker } from '@faker-js/faker';

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
  let finalLastModificationDate: string;

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
    }).then(response => {
      finalLastModificationDate = lastModificationDate(response);
    });
  });

  const add = (text: string) => {
    cy.get('[data-cy=label-input]').type('label');
    cy.get('[data-cy=text-input]').type(text);
  };

  const edit = (text: string) => {
    cy.get('[data-cy=text-input] input').clear().type(text);
  };

  const createHTTP = (payload: any) => {
    cy.request('POST', `${Cypress.env('apiUrl')}/v2/ontologies/properties`, payload).then(response => {
      cy.request(
        'POST',
        `${Cypress.env('apiUrl')}/v2/ontologies/cardinalities`,
        cardinality('yolo2', lastModificationDate(response))
      );
    });
  };

  it('can add an instance, edit, and delete for a text property', () => {
    const text1 = faker.lorem.word();
    const text2 = faker.lorem.word();

    createHTTP(short('v', finalLastModificationDate));

    // create
    cy.visit('/project/00FF/ontology/images/datamodelclass/add');
    add(text1);
    cy.get('[data-cy=submit-button]').click();
    cy.contains(text1);

    // edit
    cy.get('app-base-switch').trigger('mouseenter');
    cy.get('[data-cy=edit-button]').click();
    edit(text2);
    cy.get('[data-cy=save-button]').click();
    cy.contains(text2);

    // delete
    cy.reload(); // TODO shouldnt reload
    cy.get('app-base-switch').trigger('mouseenter');
    cy.get('[data-cy=delete-button]').click();
    cy.get('[data-cy=confirm-button]').click();
  });
});
