import { faker } from '@faker-js/faker';
import { UploadedFileResponse } from '../../../../../libs/vre/shared/app-representations/src';
import { ThingPictureClass } from '../../models/existing-data-models';
import { UserProfiles } from '../../models/user-profiles';
import { Project0001Page, Project0803Page } from '../../support/pages/existing-ontology-class-page';

describe('Check project admin existing resource functionality', () => {
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
    cy.uploadFile(<Cypress.IUploadFileParameters>{
      filePath: `../${uploadedImageFilePath}`,
      projectShortCode: Project0001Page.projectShortCode,
      mimeType: 'image/png',
    }).then(response => {
      thingPictureData.file = (response as UploadedFileResponse).internalFilename;
      cy.createResource(project0001Page.payloads.picture(thingPictureData));
    });
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
    cy.get('[data-cy=common-input-text]', { timeout: 500 }).should('be.visible').clear().type(newLabel);
    cy.get('[data-cy=edit-resource-label-submit]').click();
    cy.get('[data-cy=resource-header-label').contains(newLabel);

    cy.get('[data-cy="more-vert-image-button"]').click();
    cy.get('[data-cy="replace-image-button"]').should('be.visible').click();
    cy.get('[data-cy="replace-file-submit-button"]').should('have.attr', 'disabled');
    cy.get('[data-cy="upload-file"]').selectFile(`cypress${uploadedImageFilePath}`, { force: true });
    cy.get('[data-cy="replace-file-submit-button"]').should('not.have.attr', 'disabled');
    cy.get('[data-cy="replace-file-submit-button"]').click();

    cy.get('[data-cy=property-value]').scrollIntoView();
    cy.get('[data-cy=property-value]').first().trigger('mouseenter');
    cy.get('[data-cy="action-bubble"]', { timeout: 500 }).should('be.visible');
    cy.get('[data-cy="action-bubble"] .edit-button').should('be.visible').click();
    const newTitle = faker.lorem.sentence();
    const newComment = faker.lorem.sentence();
    cy.get('[data-cy="common-input-text"]', { timeout: 500 }).should('be.visible').clear().type(newTitle);
    cy.get('[data-cy="comment-textarea"]').should('be.visible').clear().type(newComment);
    cy.get('[data-cy="save-button"]').click();
    cy.get('[data-cy=property-value]').contains(newTitle);
    cy.get('[data-cy=show-all-comments]').scrollIntoView().click();
    cy.get('[data-cy=property-value-comment]').contains(newComment);
    cy.log('property title and comment has been changed');

    cy.get('[data-cy=add-property-value-button]').should('be.visible').click();
    cy.get('[data-cy="common-input-text"]', { timeout: 500 }).should('be.visible').type(faker.lorem.sentence());
    cy.get('[data-cy="comment-textarea"]').should('be.visible').type(faker.lorem.sentence());
    cy.get('[data-cy="save-button"]').click();
    cy.get('[data-cy="common-input-text"]', { timeout: 2000 }).should('not.exist');
    cy.get('[data-cy=property-value]').should('have.length', 2);
    cy.get('[data-cy=property-value-comment]').should('have.length', 2);
    cy.log('new property value with comment has been added');

    cy.get('[data-cy=property-value]').eq(1).trigger('mouseenter');
    cy.get('[data-cy="action-bubble"]', { timeout: 500 }).should('be.visible');
    cy.get('[data-cy="delete-button"]').should('be.visible').click();
    cy.get('[data-cy="delete-comment"]').should('be.visible').type(faker.lorem.sentence());
    cy.get('[data-cy="confirm-button"]').click();
    cy.get('[data-cy="delete-comment"]', { timeout: 2000 }).should('not.exist');
    cy.get('[data-cy=property-value]').should('have.length', 1);
    cy.get('[data-cy=show-all-comments]').scrollIntoView().click();
    cy.get('[data-cy=property-value-comment]').should('have.length', 1);
    cy.log('new property value with comment has been removed');

    cy.get('[data-cy=resource-toolbar-more-button]').click();
    cy.get('[data-cy=resource-toolbar-delete-resource-button]').click();
    cy.get('[data-cy=app-delete-resource-dialog-comment]').should('be.visible').type(faker.lorem.sentence());
    cy.get('[data-cy=app-delete-resource-dialog-button]').click();
    cy.get('[data-cy=resource-header-label]').should('not.exist');
    cy.log('Resource has been deleted');
  });

  after(() => {
    Cypress.env('skipDatabaseCleanup', false);
  });
});
