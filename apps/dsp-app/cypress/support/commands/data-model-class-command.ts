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
    cy.intercept('POST', '/v2/ontologies/classes').as('createClassRequest');

    cy.createOntology(projectUuid);

    cy.get('[data-cy=create-class-button]').scrollIntoView().should('be.visible').click();
    cy.get('[data-cy=TextRepresentation]').scrollIntoView().should('be.visible').click();
    cy.get('[data-cy=comment-textarea]').should('be.visible').clear().type(input.comment);
    cy.get('[data-cy=name-input]').clear().type(input.name);
    cy.get('[data-cy=label-input]').clear().type(input.label);
    cy.get('[data-cy=submit-button]').should('be.visible').click();

    cy.wait('@createClassRequest').wait(3000);
    cy.log('Data model class created!');

    return cy.wrap(input).as('dataModelClass');
  }
);
