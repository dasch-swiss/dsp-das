import { Project00FFPayloads } from '../../fixtures/project00FF-resource-payloads';
import { ResponseUtil } from '../../fixtures/requests';
import { AddResourceInstancePage } from '../../support/pages/add-resource-instance-page';

describe('File representation', () => {
  let lastModDate: string;
  let po: AddResourceInstancePage;
  const projectPayloads = new Project00FFPayloads();

  beforeEach(() => {
    po = new AddResourceInstancePage();
  });

  afterEach(() => {
    cy.get('[data-cy=resource-toolbar-more-button]').click();
    cy.get('[data-cy=resource-toolbar-delete-resource-button]').click();
    cy.get('app-delete-resource-dialog').should('be.visible');
    cy.get('[data-cy=app-delete-resource-dialog-comment]').type('because I can');
    cy.get('[data-cy=app-delete-resource-dialog-button]').click();
    cy.visit('/project/00FF/ontology/images/datamodelclass');
    cy.get('[data-cy=list-view-no-results]').should('be.visible');
  });

  it('external iiif image', () => {
    const classPayload = projectPayloads.stillImageRepresentation('datamodelclass');
    const invalidIifImageUrl = 'https://example.com/wrong.jpg';
    const validIifImageUrl = 'https://ids.lib.harvard.edu/ids/iiif/24209711/full/105,/0/default.jpg';
    const encodedValidIifImageUrl =
      'https://iiif.wellcomecollection.org/image/b20432033_B0008608.JP2/full/880%2C/0/default.jpg';

    cy.request('POST', `${Cypress.env('apiUrl')}/v2/ontologies/classes`, classPayload)
      .then(response => {
        lastModDate = ResponseUtil.lastModificationDate(response);
      })
      .then(() => {
        po.visitAddPage();
        cy.get('[data-cy=upload-control]').should('be.visible');

        cy.get('[data-cy=stillimage-tab-group]').within(() => {
          cy.contains('.mdc-tab__text-label', 'External IIIF URL').click();
        });
        cy.get('app-third-part-iiif').should('be.visible');

        // create
        po.addInitialLabel();
        cy.get('[data-cy=external-iiif-input]').type(invalidIifImageUrl);
        cy.get('[data-cy=external-iiif-input]').should('have.value', invalidIifImageUrl);

        // try to submit with invalid url
        po.clickOnSubmit();
        cy.get('mat-error').should('contain.text', 'The provided URL is not a valid IIIF image URL');
        cy.get('[data-cy=external-iiif-reset]').click();
        cy.get('[data-cy=external-iiif-input]').should('have.value', '');

        cy.window().then(win => {
          cy.stub(win.navigator.clipboard, 'readText').resolves(validIifImageUrl);

          cy.get('[data-cy=external-iiif-paste]').click();

          cy.get('[data-cy=external-iiif-input]').should('have.value', validIifImageUrl);
        });

        cy.get('img[alt="IIIF Preview"]').should('have.attr', 'src', validIifImageUrl).should('be.visible');
        po.clickOnSubmit();

        cy.intercept('GET', '**/iiif/24209711/info.json').as('iiifInfoRequest');
        cy.wait('@iiifInfoRequest').its('response.statusCode').should('eq', 200);

        cy.get('[data-cy=resource-header-label]').should('contain.text', 'label');
        cy.get('app-still-image').should('be.visible');
        cy.get('.osd-container canvas').should('be.visible');

        cy.get('[data-cy=still-image-share-button]').should('be.disabled');
        cy.get('[data-cy=still-image-download-button]').should('be.disabled');
        cy.get('[data-cy=still-image-region-button]').should('be.disabled');

        // edit
        cy.get('[data-cy=more-vert-image-button]').should('be.visible').click();
        cy.get('[data-cy=replace-image-button]').should('be.visible').click();
        cy.get('app-third-part-iiif').should('be.visible');
        cy.get('[data-cy=external-iiif-input]').should('have.value', validIifImageUrl);

        cy.get('[data-cy=external-iiif-input]').clear().type(encodedValidIifImageUrl);
        cy.get('[data-cy=external-iiif-input]').should('have.value', encodedValidIifImageUrl);
        cy.get('img[alt="IIIF Preview"]').should('have.attr', 'src', encodedValidIifImageUrl);
        po.clickOnSubmit();
        cy.get('[data-cy=resource-header-label]').should('contain.text', 'label');
        cy.get('app-still-image').should('be.visible');

        cy.intercept('GET', '**/info.json').as('iiifInfoRequest');
        cy.wait('@iiifInfoRequest').its('response.statusCode').should('eq', 200);
      });
  });
});
