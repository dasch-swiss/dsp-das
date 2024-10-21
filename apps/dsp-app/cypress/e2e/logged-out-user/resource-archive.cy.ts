import { faker } from '@faker-js/faker';
import { UploadedFileResponse } from '../../../../../libs/vre/shared/app-representations/src';
import { Project00FFPayloads } from '../../fixtures/project00FF-payloads';
import { ResponseUtil } from '../../fixtures/requests';
import { ArchiveClass } from '../../models/existing-data-models';
import { Project00FFPage } from '../../support/pages/existing-ontology-class-page';

describe('Create archive model, add new data and view it', () => {
  let projectPage: Project00FFPage;
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
    projectPage = new Project00FFPage();

    cy.loginAdmin();
    cy.request(
      'POST',
      `${Cypress.env('apiUrl')}/v2/ontologies/classes`,
      Project00FFPayloads.createClassPayload(
        archiveData.className,
        'http://api.knora.org/ontology/knora-api/v2#ArchiveRepresentation'
      )
    ).then(response => {
      finalLastModificationDate = ResponseUtil.lastModificationDate(response);
      cy.uploadFile(`../${uploadedArchiveFilePath}`, Project00FFPage.projectShortCode).then(response => {
        archiveData.file = (response as UploadedFileResponse).internalFilename;
        cy.createResource(Project00FFPayloads.archive(archiveData));
      });
    });

    cy.logout();
  });

  it('archive representation should be present', () => {
    cy.intercept('GET', '**/file').as('archiveFileRequest');
    projectPage.ontologyName = Project00FFPayloads.defaultOntology;
    projectPage.visitClass(archiveData.className);
  });
});
