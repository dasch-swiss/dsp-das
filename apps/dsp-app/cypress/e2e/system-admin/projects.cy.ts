import { faker } from '@faker-js/faker';
import { customShortcode } from '../../support/helpers/custom-shortcode';

describe('Projects', () => {
  it('user can create a project that is then displayed', () => {
    const data = {
      shortcode: customShortcode(),
      shortname: faker.internet.userName(),
      longname: faker.company.name(),
      description: faker.lorem.sentence(),
      keywords: faker.lorem.words(3).split(' '),
    };

    cy.intercept('POST', '/admin/projects').as('submitRequest');

    cy.visit('/project/create-new');
    cy.get('[data-cy=shortcode-input]').type(data.shortcode);
    cy.get('[data-cy=shortname-input]').type(data.shortname);
    cy.get('[data-cy=longname-input]').type(data.longname);
    cy.get('[data-cy=description-input]').type(data.description);
    cy.get('[data-cy=keywords-input]').type(`${data.keywords.join('{enter}')}{enter}`);
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@submitRequest');
    cy.url().should('match', /\/project\/(.+)/);
    cy.contains(data.shortcode).should('be.visible');
    cy.contains(data.description).should('be.visible');
    data.keywords.forEach(keyword => cy.contains(keyword).should('be.visible'));
  });
});
