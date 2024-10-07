Cypress.Commands.add('createResource', (payload: any) =>
  cy.request('POST', `${Cypress.env('apiUrl')}/v2/resources`, payload).then(response => {
    console.log(response);
  })
);

Cypress.Commands.add('uploadFile', (payload: any) =>
  cy.request('OPTIONS', `${Cypress.env('apiUrl')}/v2/resources`, payload).then(response => {
    console.log(response);
  })
);
