import { faker } from '@faker-js/faker';
import { UploadedFileResponse } from '../../../../../libs/vre/shared/app-representations/src';
import { Project0803ResourcePayloads } from '../../fixtures/project0803-resource-payloads';
import { ResponseUtil } from '../../fixtures/requests';
import { ArchiveClass } from '../../models/existing-data-models';
import { Project0803Page } from '../../support/pages/existing-ontology-class-page';

describe('Create archive model, add new data and view it', () => {
  const path = require('path');
  const projectPayloads = new Project0803ResourcePayloads();
  let projectAssertionPage: Project0803Page;
  let finalLastModificationDate: string;

  const archiveData: ArchiveClass = {
    className: faker.lorem.word(),
    label: faker.lorem.word(),
    file: '',
  };

  const archiveFile = 'dummy.txt.zip';

  beforeEach(() => {
    projectAssertionPage = new Project0803Page();

    cy.loginAdmin();
    cy.request(
      'POST',
      `${Cypress.env('apiUrl')}/v2/ontologies/classes`,
      projectPayloads.createClassPayload(
        archiveData.className,
        'http://api.knora.org/ontology/knora-api/v2#ArchiveRepresentation'
      )
    ).then(response => {
      finalLastModificationDate = ResponseUtil.lastModificationDate(response);
      cy.uploadFile(`../uploads/${archiveFile}`, projectAssertionPage.projectShortCode).then(response => {
        archiveData.file = (response as UploadedFileResponse).internalFilename;
        const data = Project0803ResourcePayloads.archive(archiveData);
        cy.createResource(data);
        cy.request(
          `${Cypress.env('sipiIIIfUrl')}/${projectAssertionPage.projectShortCode}/${archiveData.file}/file`
        ).then(response => {
          expect(response.status).to.eq(200);
        });
        cy.screenshot('upload-resource-archive-screenshot', {
          scale: false,
          overwrite: true,
          capture: 'runner',
        });
      });
    });

    cy.logout();
  });

  it('archive representation should be present', () => {
    projectAssertionPage.visitClass(archiveData.className);
    cy.get('[data-cy=accept-cookies]').click();
    cy.get('[data-cy=resource-list-item] h3.res-class-value').contains(archiveData.label).click();
    cy.get('[data-cy=resource-header-label]').contains(archiveData.label);
    cy.get('.representation-container').should('exist');
    cy.get('app-archive').should('be.visible');
    cy.get('[data-cy=original-file-name]').contains(archiveFile);
    cy.get('[data-cy=more-button]').click();
    cy.get('[data-cy=download-file-button]').click();
    cy.readFile(path.join(Cypress.config('downloadsFolder'), 'file.zip')).should('exist');
  });
});
