import { uploadProjectFile } from '../helpers/file-uploader';

Cypress.Commands.add('createResource', (payload: any) => {
  const cypressRequestOptions: Cypress.RequestOptions = {
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/v2/resources`,
    body: payload,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`,
      Accept: '*/*',
      'X-Asset-Ingested': '1',
      'Accept-Encoding': 'gzip, deflate, br',
    },
  };
  return cy.request(cypressRequestOptions).then(response => {
    console.log(response);
  });
});

Cypress.Commands.add('uploadFile', (filePath: string, projectShortCode: string, mimeType = 'image/png') =>
  cy
    .fixture(filePath, 'binary')
    .then(fileContent => uploadProjectFile(filePath, mimeType, projectShortCode, fileContent))
);

Cypress.Commands.add('getCanvas', selector => {
  return cy.get(selector).then(canvas => canvas[0]);
});
