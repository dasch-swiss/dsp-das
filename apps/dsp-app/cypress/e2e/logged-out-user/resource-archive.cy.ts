import { faker } from '@faker-js/faker';
import { UploadedFileResponse } from '../../../../../libs/vre/shared/app-representations/src';
import { Project00FFPayloads } from '../../fixtures/project00FF-payloads';
import { ResponseUtil } from '../../fixtures/requests';
import { ArchiveClass } from '../../models/existing-data-models';
import { Project0001Page } from '../../support/pages/existing-ontology-class-page';

describe('Create archive model, add new data and view it', () => {
  let project0001Page: Project0001Page;
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
    project0001Page = new Project0001Page();

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
      cy.uploadFile(`../${uploadedArchiveFilePath}`, Project0001Page.projectShortCode).then(response => {
        archiveData.file = (response as UploadedFileResponse).internalFilename;
        cy.createResource(Project00FFPayloads.archive(archiveData));
      });
    });

    cy.logout();
  });

  it('archive representation should be present', () => {
    cy.intercept('GET', '**/file').as('archiveFileRequest');
    project0001Page.ontologyName = Project00FFPayloads.defaultOntology;
    project0001Page.visitClass(archiveData.className);
  });
});
