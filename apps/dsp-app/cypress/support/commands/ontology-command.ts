Cypress.Commands.add('createOntology', (input: Ontology, projectUuid: string) => {
  cy.intercept('POST', '/v2/ontologies').as('submitRequest');
  cy.visit(`/project/${projectUuid}/data-models`);
  cy.get('[data-cy=data-models-container]').find('[data-cy=create-button]').scrollIntoView().click();

  cy.get('[data-cy=name-input]').type(input.name);
  cy.get('[data-cy=label-input]').clear().type(input.label);
  cy.get('[data-cy=comment-textarea]').type(input.comment);
  cy.get('[data-cy=submit-button]').click();

  cy.wait('@submitRequest');
});
