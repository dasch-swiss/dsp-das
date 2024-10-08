import { faker } from '@faker-js/faker';
import { UploadedFileResponse } from '../../../../../libs/vre/shared/app-representations/src';
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
    titleComment: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    descriptionComment: faker.lorem.sentence(),
    comments: [{ text: faker.lorem.sentence(), comment: faker.lorem.sentence() }],
  };

  beforeEach(() => {
    ontoClassPage = new ExistingOntologyClassPage();
    cy.loginAdmin().then(() => {
      cy.uploadFile(
        '../uploads/Fingerprint_Logo_coloured.png',
        ExistingOntologyClassPage.existingProjectShortCode
      ).then(response => {
        sidebandData.file = (response as UploadedFileResponse).internalFilename;
        cy.createResource(ExistingClassResourcePayloads.sideband(sidebandData));
      });
    });
    cy.createResource(ExistingClassResourcePayloads.misc(miscData));
    cy.logout();
  });

  it('should not be accessible and return to page', () => {
    cy.visit('/project/0803/ontology/incunabula/book/add');
    const regex = new RegExp('/project/0803$');
    cy.url().should('match', regex);
  });

  it('label, color, comment properties should be present', () => {
    ontoClassPage.visitClass('misc');
    cy.get('[data-cy=resource-header-label]').contains(miscData.label);
    cy.get('[data-cy=color-box]')
      .should('have.css', 'background-color')
      .should('contain', onecolor(miscData.color).css().replaceAll(',', ', '));
    cy.get('[data-cy=show-all-comments]').click();
    cy.get('[data-cy=property-value-comment]').contains(miscData.colorComment);
  });

  it('still image should be present', () => {
    ontoClassPage.visitClass('Sideband');
    cy.get('[data-cy=resource-header-label]').contains(miscData.label);
    cy.get('[data-cy=show-all-comments]').click();
    cy.get('[data-cy=property-value-comment]').contains(miscData.colorComment);
  });
});
