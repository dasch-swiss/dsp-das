import { faker } from '@faker-js/faker';

describe('Ontologies', () => {
  beforeEach(() => {});

  it.only('user can create an ontology', () => {});

  it('user can create a list', () => {
    cy.intercept('POST', '/admin/lists').as('submitRequest');

    cy.visit('/project/00FF/add-list');
    cy.get('[data-cy=labels-input]').type(faker.lorem.words(2));
    cy.get('[data-cy=comments-input]').type(faker.lorem.sentence());
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@submitRequest');
    cy.url().should('match', /\/project\/00FF\/list\/(.+)/);
  });

  it('user can edit a list', () => {
    const data = {
      label: faker.lorem.words(2),
      comment: faker.lorem.word(2),
    };
    cy.intercept('PUT', '/admin/lists/*').as('editRequest');

    cy.visit(listUrl);

    cy.get('[data-cy=edit-button]').click();
    cy.get('[data-cy=labels-input] input').clear().type(data.label, { force: true });
    cy.get('[data-cy=comments-input]').clear().type(data.comment);
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@editRequest');
    cy.url().should('match', /\/project\/00FF\/list\/(.+)/);
    cy.get('[data-cy=label-title]').contains(data.label);
    cy.get('[data-cy=comment-title]').contains(data.comment);
  });

  it('user can delete a list', () => {
    cy.visit(listUrl);
    cy.intercept('DELETE', '/admin/lists/*').as('deleteRequest');
    cy.get('[data-cy=delete-button]').click();
    cy.get('[data-cy=confirmation-button]').click();
    cy.wait('@deleteRequest');

    cy.url().should('match', /\/project\/00FF\/data-models$/);
  });
});
