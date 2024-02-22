import { faker } from '@faker-js/faker';

Cypress.Commands.add(
  'createOntology',
  (
    projectUuid: string,
    input: Ontology = <Ontology>{
      name: faker.string.alpha({ length: { min: 3, max: 16 } }),
      label: faker.lorem.words(5),
      comment: faker.lorem.sentence(),
    }
  ) => {
    cy.intercept('POST', '/v2/ontologies').as('submitRequest');
    cy.visit(`/project/${projectUuid}/data-models`);

    cy.get('[data-cy=data-models-container]').find('[data-cy=create-button]').scrollIntoView().click();
    cy.get('[data-cy=comment-textarea]').type(input.comment);
    cy.get('[data-cy=name-input]').type(input.name);
    cy.get('[data-cy=label-input]').clear().type(input.label);
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@submitRequest');

    cy.log('Ontology created!');
    return cy.wrap(input).as('ontology');
  }
);
