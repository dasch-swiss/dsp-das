import { faker } from '@faker-js/faker';
import { ResourceCreationPayloads } from '../../fixtures/resource-creation-payloads';
import { AddResourceInstancePage } from '../../support/pages/add-resource-instance-page';

const cardinality = (lastModificationDate: string) => {
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

  const createHTTP = (payload: any) => {
    cy.request('POST', `${Cypress.env('apiUrl')}/v2/ontologies/properties`, payload).then(response => {
      cy.request(
        'POST',
        `${Cypress.env('apiUrl')}/v2/ontologies/cardinalities`,
        cardinality(lastModificationDate(response))
      );
    });
  };

  describe('can add an instance, edit, and delete for a property', () => {
    let po: AddResourceInstancePage;

    beforeEach(() => {
      po = new AddResourceInstancePage();
    });
    it('text', () => {
      const initialValue = faker.lorem.word();
      const editedValue = faker.lorem.word();

      createHTTP(ResourceCreationPayloads.textShort(finalLastModificationDate));
      po.visitAddPage();

      // create
      po.addInitialLabel();
      cy.get('[data-cy=text-input]').type(initialValue);
      po.addSubmit();
      cy.contains(initialValue);

      // edit
      po.setupEdit();
      cy.get('[data-cy=text-input] input').clear().type(editedValue);
      po.saveEdit();
      cy.contains(editedValue);

      // delete
      po.delete();
    });

    it('number', () => {
      const intInput = () => cy.get('[data-cy=int-input]');
      const initialValue = faker.number.int({ min: 0, max: 100 });
      const editedValue = faker.number.int({ min: 0, max: 100 });

      createHTTP(ResourceCreationPayloads.number(finalLastModificationDate));
      po.visitAddPage();

      // create
      po.addInitialLabel();
      intInput().type(initialValue.toString());
      po.addSubmit();
      cy.contains(initialValue.toString());

      // edit
      po.setupEdit();
      intInput().clear().type(editedValue.toString());
      po.saveEdit();
      cy.contains(editedValue);

      // delete
      po.delete();
    });

    it('boolean', () => {
      const boolToggle = () => cy.get('[data-cy=bool-toggle]');
      createHTTP(ResourceCreationPayloads.boolean(finalLastModificationDate));
      po.visitAddPage();

      // create
      po.addInitialLabel();
      boolToggle().click();
      po.addSubmit();

      // edit
      po.setupEdit();
      boolToggle().click();
      po.saveEdit();

      // delete
      po.delete();
    });
  });
});
