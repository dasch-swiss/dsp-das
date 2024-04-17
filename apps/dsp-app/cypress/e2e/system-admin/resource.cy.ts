import { faker } from '@faker-js/faker';
import { ListGetResponseADM } from '../../../../../libs/vre/open-api/src';
import { ResourceCreationPayloads } from '../../fixtures/resource-creation-payloads';
import { AddResourceInstancePage } from '../../support/pages/add-resource-instance-page';

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
        ResourceCreationPayloads.cardinality(lastModificationDate(response))
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
      cy.get('app-base-switch').contains('true');

      // edit
      po.setupEdit();
      boolToggle().click();
      po.saveEdit();
      cy.get('app-base-switch').contains('false');

      // delete
      po.delete();
    });

    it('color', () => {
      const color = { hex: '#02A2A2', rgb: 'rgb(2, 162, 162)' };
      const editedColor = { hex: '#A3B3F3', rgb: 'rgb(163, 179, 243)' };

      const enterNewValue = (value: string) => {
        cy.get('[data-cy=color-picker-input]').click();
        cy.get('.color-picker .hex-text .box input').clear().type(value);
      };

      const checkColor = (rgb: string) => {
        cy.get('[data-cy=color-box]').should('have.css', 'background-color').and('eq', rgb);
      };

      createHTTP(ResourceCreationPayloads.color(finalLastModificationDate));
      po.visitAddPage();

      // create
      po.addInitialLabel();
      enterNewValue(color.hex);
      po.addSubmit();
      checkColor(color.rgb);
      // edit
      po.setupEdit();
      enterNewValue(editedColor.hex);
      po.saveEdit();
      checkColor(editedColor.rgb);

      // delete
      po.delete();
    });

    it('place', () => {
      const initialValue = 'Basel';
      const editedValue = 'Allschwil';

      const enterAutocomplete = (value: string) => {
        cy.get('[data-cy=geoname-autocomplete]').type(value).click();
        cy.wait(2000);
        cy.get('[data-cy=geoname-autocomplete]').type('{downarrow}{enter}');
      };

      createHTTP(ResourceCreationPayloads.place(finalLastModificationDate));
      po.visitAddPage();

      // create
      po.addInitialLabel();
      enterAutocomplete(initialValue);
      po.addSubmit();
      cy.contains(initialValue);

      // edit
      po.setupEdit();
      enterAutocomplete(editedValue);
      po.saveEdit();
      cy.contains(editedValue);

      // delete
      po.delete();
    });

    const propertyListPayload = (lastModificationDate: string, listId: string) => {
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
              '@id': 'http://api.knora.org/ontology/knora-api/v2#ListValue',
            },
            'http://www.w3.org/2000/01/rdf-schema#label': {
              '@language': 'de',
              '@value': 'property',
            },
            'http://www.w3.org/2000/01/rdf-schema#subPropertyOf': {
              '@id': 'http://api.knora.org/ontology/knora-api/v2#hasValue',
            },
            'http://api.knora.org/ontology/salsah-gui/v2#guiElement': {
              '@id': 'http://api.knora.org/ontology/salsah-gui/v2#Pulldown',
            },
            'http://api.knora.org/ontology/salsah-gui/v2#guiAttribute': [`hlist=<${listId}>`],
            '@id': 'http://0.0.0.0:3333/ontology/00FF/images/v2#property',
            '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
          },
        ],
      };
    };
    it('list', () => {
      let listId: string;
      const item1Name = faker.lorem.word();
      const item2Name = faker.lorem.word();

      const sendCreateListItemRequest = (_listId: string, name: string) => {
        return cy.request('POST', `${Cypress.env('apiUrl')}/admin/lists/${encodeURIComponent(_listId)}`, {
          parentNodeIri: listId,
          projectIri: 'http://rdfh.ch/projects/00FF',
          labels: [
            {
              language: 'de',
              value: name,
            },
          ],
          name: `RandomName${name}`,
        });
      };

      const clickOnListElement = (index: number) => {
        cy.get('[data-cy=select-list-button]').click();
        cy.get('[data-cy=list-item-button]').eq(index).click();
      };

      cy.request<ListGetResponseADM>('POST', `${Cypress.env('apiUrl')}/admin/lists`, {
        comments: [{ language: 'de', value: faker.lorem.words(2) }],
        labels: [{ language: 'de', value: faker.lorem.words(2) }],
        projectIri: 'http://rdfh.ch/projects/00FF',
      })
        .then(response => {
          listId = response.body.list.listinfo.id;
          sendCreateListItemRequest(listId, item1Name);
        })
        .then(() => sendCreateListItemRequest(listId, item2Name))
        .then(() => createHTTP(propertyListPayload(finalLastModificationDate, listId)))
        .then(() => {
          po.visitAddPage();

          // create
          po.addInitialLabel();
          clickOnListElement(0);
          po.addSubmit();
          cy.contains(item1Name);

          // edit
          po.setupEdit();
          clickOnListElement(1);
          po.saveEdit();
          cy.contains(item2Name);

          // delete
          po.delete();
        });
    });

    it('link BUGS BECAUSE OF DISPLAY EDIT 2 TEMPLINK SERVICE', () => {
      // create John Smith person
      cy.request('POST', `${Cypress.env('apiUrl')}/v2/resources`, {
        '@type': 'http://0.0.0.0:3333/ontology/00FF/images/v2#person',
        'http://www.w3.org/2000/01/rdf-schema#label': 'john',
        'http://api.knora.org/ontology/knora-api/v2#attachedToProject': {
          '@id': 'http://rdfh.ch/projects/00FF',
        },
        'http://0.0.0.0:3333/ontology/00FF/images/v2#lastname': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
          'http://api.knora.org/ontology/knora-api/v2#valueAsString': 'john',
        },
        'http://0.0.0.0:3333/ontology/00FF/images/v2#firstname': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
          'http://api.knora.org/ontology/knora-api/v2#valueAsString': 'smith',
        },
      })
        .then(response => {
          createHTTP(ResourceCreationPayloads.link(finalLastModificationDate));
        })
        .then(() => {
          po.visitAddPage();
          const input = cy.get('[data-cy=link-input]');

          // create
          po.addInitialLabel();
          input.type('John').click();
          cy.wait(2000);
          input.type('{downarrow}{downarrow}{enter}');
          po.addSubmit();

          // edit
          po.setupEdit();
          po.saveEdit();

          // delete
          po.delete();
        });
    });
    it.only('date', () => {
      createHTTP(ResourceCreationPayloads.date(finalLastModificationDate));
      po.visitAddPage();

      // create
      po.addInitialLabel();
      cy.get('.mat-mdc-form-field-icon-suffix > .mat-icon').click();
      cy.get('#mat-input-6').clear().type('2023');
      cy.get(':nth-child(4) > :nth-child(4) > .selectable').click();
      po.addSubmit();

      // edit
      po.setupEdit();
      cy.get('.date-form-grid > .mat-mdc-tooltip-trigger > .mat-mdc-button-touch-target').click();
      po.saveEdit();

      // delete
      po.delete();
    });
  });

  it('can add a string value multiple with empty data');
  it('can add an empty value when it is not required');
});
