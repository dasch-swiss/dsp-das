Cypress.Commands.add('createDataModelClass', (input: DataModelClass, ontologyUuid: string) => {
  cy.intercept('POST', '/v2/ontologies/classes').as('createRequest');
  cy.get('[data-cy=create-class-button]').scrollIntoView().click();
  cy.get('[data-cy=TextRepresentation]').scrollIntoView().click({ force: true });
  cy.get('[data-cy=name-input]').clear().type(input.name);
  cy.get('[data-cy=label-input]').clear().type(input.label);
  cy.get('[data-cy=comment-textarea]').type(input.comment);
  cy.get('[data-cy=submit-button]').click();

  cy.wait('@createRequest');
});
