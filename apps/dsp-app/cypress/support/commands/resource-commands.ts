import { uploadProjectFile } from '../helpers/file-uploader';

Cypress.Commands.add('createResource', (payload: any) =>
  cy.request('POST', `${Cypress.env('apiUrl')}/v2/resources`, payload).then(response => {
    console.log(response);
  })
);

Cypress.Commands.add('uploadFile', (filePath: string, projectShortCode: string, mimeType = 'image/png') =>
  cy
    .fixture(filePath, 'binary')
    .then(fileContent => uploadProjectFile(filePath, mimeType, projectShortCode, fileContent))
);
