import { faker } from '@faker-js/faker';

describe('Lists', () => {
  it.skip('user can create/edit/delete a list', () => {
    cy.intercept('POST', '/admin/lists').as('submitRequest');

    cy.visit('/project/0803/add-list');
    cy.get('[data-cy=labels-input]').type(faker.lorem.words(2));
    cy.get('[data-cy=comments-input]').type(faker.lorem.sentence());
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@submitRequest');
    cy.url().should('match', /\/project\/0803\/list\/(.+)/);

    cy.intercept('PATCH', '/admin/lists').as('editRequest');

    const data = {
      label: faker.lorem.words(2),
      comment: faker.lorem.sentence(),
    };
    cy.get('[data-cy=edit-button]').click();
    cy.get('[data-cy=labels-input]').type(data.label);
    cy.get('[data-cy=comments-input]').type(data.comment);
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@editRequest');
    cy.url().should('match', /\/project\/0803\/list\/(.+)/);
  });
});
