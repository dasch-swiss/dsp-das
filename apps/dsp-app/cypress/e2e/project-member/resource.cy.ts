import { faker } from '@faker-js/faker';
import { UploadedFileResponse } from '../../../../../libs/vre/shared/app-representations/src';
import { ThingPictureClass } from '../../models/existing-data-models';
import { UserProfiles } from '../../models/user-profiles';
import { Project0001Page, Project0803Page } from '../../support/pages/existing-ontology-class-page';

describe('View Existing Resource', () => {
  let project0001Page: Project0001Page;

  const thingPictureData: ThingPictureClass = {
    label: faker.lorem.word(),
    file: '',
    titles: [{ text: faker.lorem.sentence(), comment: faker.lorem.sentence() }],
  };

  const uploadedImageFilePath = '/uploads/Fingerprint_Logo_coloured.png';

  before(() => {
    cy.resetDatabase();
    Cypress.env('skipDatabaseCleanup', true);

    project0001Page = new Project0001Page();

    cy.loginAdmin();
    cy.uploadFile(`../${uploadedImageFilePath}`, Project0001Page.projectShortCode).then(response => {
      thingPictureData.file = (response as UploadedFileResponse).internalFilename;
      cy.createResource(project0001Page.payloads.picture(thingPictureData));
    });
    cy.logout();
  });

  beforeEach(() => {
    cy.readFile('cypress/fixtures/user_profiles.json').then((json: UserProfiles) => {
      const users: UserProfiles = json;
      cy.login({
        username: users.anythingProjectAdmin_username,
        password: users.anythingProjectAdmin_password,
      });
    });
  });

  it('cant add other project resource', () => {
    const path = `/project/${Project0803Page.projectShortCode}/ontology/${Project0803Page.ontologyName}/book/add`;
    cy.visit(path);
    cy.url().should('not.contain', Project0803Page.projectShortCode);
  });

  it('can add owned project resource', () => {
    const path = `/project/${Project0001Page.projectShortCode}/ontology/${Project0001Page.defaultOntology}/ThingPicture/add`;
    cy.visit(path);
    const regex = new RegExp(`${path}$`);
    cy.url().should('match', regex);
  });

  it('ThingPicture resource should be visible', () => {
    cy.intercept('GET', '**/default.jpg').as('stillImageRequest');
    project0001Page.visitClass('ThingPicture');
    cy.get('[data-cy=resource-list-item] h3.res-class-value').contains(thingPictureData.label).click();
    cy.should('not.contain', '[data-cy=close-restricted-button]');
    cy.get('[data-cy=resource-header-label]').contains(thingPictureData.label);
    cy.get('.representation-container').should('exist');
    cy.get('app-still-image').should('be.visible');
    cy.log('waiting for still image request');
    cy.wait('@stillImageRequest').its('request.url').should('include', thingPictureData.file);
    cy.wait('@stillImageRequest').its('response.statusCode').should('eq', 200);
    cy.get('[data-cy=property-value]').contains(thingPictureData.titles[0].text);
    cy.get('[data-cy=show-all-comments]').scrollIntoView().click();
    cy.get('[data-cy=property-value-comment]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=property-value-comment]').contains(thingPictureData.titles[0].comment);
  });

  it('ThingPicture resource should be editable', () => {
    project0001Page.visitClass('ThingPicture');
    cy.get('[data-cy=resource-list-item] h3.res-class-value').contains(thingPictureData.label).click();
    cy.get('[data-cy=resource-header-label]').contains(thingPictureData.label);
    cy.get('[data-cy=edit-label-button]').should('be.visible').click();
    const newLabel = faker.lorem.word();
    cy.get('[data-cy=common-input-text]').should('be.visible').clear().type(newLabel);
    cy.get('[data-cy=edit-resource-label-submit]').click();
    cy.get('[data-cy=resource-header-label').contains(newLabel);
  });

  after(() => {
    Cypress.env('skipDatabaseCleanup', false);
  });
});
