import { faker } from '@faker-js/faker';
import { UploadedFileResponse } from '../../../../../libs/vre/shared/app-representations/src';
import { Project0803ResourcePayloads } from '../../fixtures/project0803-resource-payloads';
import { ResponseUtil } from '../../fixtures/requests';
import { ArchiveClass } from '../../models/existing-data-models';
import { Project0803Page } from '../../support/pages/existing-ontology-class-page';

describe('Create archive model, add new data and view it', () => {
  const projectPayloads = new Project0803ResourcePayloads();
  let projectAssertionPage: Project0803Page;
  let finalLastModificationDate: string;

  const archiveData: ArchiveClass = {
    className: faker.lorem.word(),
    label: faker.lorem.word(),
    file: '',
    title: {
      text: faker.lorem.sentence(),
      comment: faker.lorem.sentence(),
    },
  };

  const uploadedArchiveFilePath = '/uploads/dummy.txt.zip';

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
      cy.uploadFile(`../${uploadedArchiveFilePath}`, projectAssertionPage.projectShortCode).then(response => {
        archiveData.file = (response as UploadedFileResponse).internalFilename;
        const data = Project0803ResourcePayloads.archive(archiveData);
        cy.createResource(data);
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
  });
});
