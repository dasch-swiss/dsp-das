import { faker } from '@faker-js/faker';

Cypress.Commands.add(
  'createDataModelClass',
  (
    projectUuid: string,
    input = <DataModelClass>{
      name: faker.string.alpha({ length: { min: 3, max: 16 } }),
      label: faker.lorem.text(),
      comment: faker.lorem.sentence(),
    }
  ) => {
    cy.intercept('POST', '/v2/ontologies/classes').as('createRequest');

    cy.createOntology(projectUuid);

    cy.get('[data-cy=create-class-button]').scrollIntoView().should('be.visible').click();
    cy.get('[data-cy=TextRepresentation]').scrollIntoView().should('be.visible').click({ force: true });
    cy.get('[data-cy=name-input]').clear().type(input.name);
    cy.get('[data-cy=label-input]').clear().type(input.label);
    cy.get('[data-cy=comment-textarea]').type(input.comment);
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@createRequest');
    return cy.wrap(input).as('dataModelClass');
  }
);
