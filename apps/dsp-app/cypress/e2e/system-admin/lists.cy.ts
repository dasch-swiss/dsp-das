import { faker } from '@faker-js/faker';

describe('Lists', () => {
  it('user can create/edit/delete a list', () => {
    // create
    cy.intercept('POST', '/admin/lists').as('submitRequest');

    cy.visit('/project/0803/add-list');
    cy.get('[data-cy=labels-input]').type(faker.lorem.words(2));
    cy.get('[data-cy=comments-input]').type(faker.lorem.sentence());
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@submitRequest');
    cy.url().should('match', /\/project\/0803\/list\/(.+)/);

    // edit
    cy.intercept('PUT', '/admin/lists/*').as('editRequest');

    const data = {
      label: faker.lorem.words(2),
      comment: faker.lorem.sentence(),
    };
    cy.get('[data-cy=edit-button]').click();

    cy.get('[data-cy=labels-input] input').type(data.label, { force: true });
    cy.get('[data-cy=comments-input]').type(data.comment);
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@editRequest');
    cy.url().should('match', /\/project\/0803\/list\/(.+)/);

    // delete
    cy.intercept('DELETE', '/admin/lists/*').as('deleteRequest');
    cy.get('[data-cy=delete-button]').click();
    cy.get('[data-cy=confirmation-button]').click();
    cy.wait('@deleteRequest');

    cy.url().should('match', /\/project\/0803\/data-models$/);
  });
});
