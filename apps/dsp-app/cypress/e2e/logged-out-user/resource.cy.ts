import { faker } from '@faker-js/faker';
import { ExistingClassResourcePayloads } from '../../fixtures/existing-class-resource-payloads';
import { MiscClass, SidebandClass } from '../../models/incunabula-data-models';
import { ExistingOntologyClassPage } from '../../support/pages/existing-ontology-class-page';

describe('View Existing Resource', () => {
  const onecolor = require('onecolor');

  let ontoClassPage: ExistingOntologyClassPage;
  const miscData: MiscClass = {
    label: faker.lorem.word(),
    color: faker.color.rgb(),
    colorComment: faker.lorem.sentence(),
    book: '',
    bookComment: faker.lorem.sentence(),
  };

  const sidebandData: SidebandClass = {
    label: faker.lorem.word(),
    file: '',
    title: faker.lorem.sentence(),
  };

  beforeEach(() => {
    ontoClassPage = new ExistingOntologyClassPage();
    cy.loginAdmin();
    cy.createResource(ExistingClassResourcePayloads.misc(miscData));
    //cy.createResource(ExistingClassResourcePayloads.sideband(sidebandData));
    cy.logout();
  });

  it('should not be accessible and return to page', () => {
    cy.visit('/project/0803/ontology/incunabula/book/add');
    const regex = new RegExp('/project/0803$');
    cy.url().should('match', regex);
  });

  it.only('label, color, comment properties should be present', () => {
    ontoClassPage.visitClass('misc');
    cy.get('[data-cy=resource-header-label]').contains(miscData.label);
    cy.get('[data-cy=color-box]')
      .should('have.css', 'background-color')
      .should('contain', onecolor(miscData.color).css().replaceAll(',', ', '));
    cy.get('[data-cy=show-all-comments]').click();
    cy.get('[data-cy=property-value-comment]').contains(miscData.colorComment);
  });

  it('still image should be present', () => {
    ontoClassPage.visitClass('misc');
    cy.get('[data-cy=resource-header-label]').contains(miscData.label);
    cy.get('[data-cy=color-box]')
      .should('have.css', 'background-color')
      .should('contain', onecolor(miscData.color).css().replaceAll(',', ', '));
    cy.get('[data-cy=show-all-comments]').click();
    cy.get('[data-cy=property-value-comment]').contains(miscData.colorComment);
  });
});
