describe('File Upload Test', () => {
  it('Uploads a file via HTTP POST request', () => {
    const fileName = 'assets/screen.png'; // Your file path

    const token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIwLjAuMC4wOjMzMzMiLCJzdWIiOiJodHRwOi8vcmRmaC5jaC91c2Vycy9yb290IiwiYXVkIjpbIktub3JhIiwiU2lwaSIsImh0dHA6Ly9sb2NhbGhvc3Q6MzM0MCJdLCJleHAiOjE3MzE1NzAwNzcsImlhdCI6MTcyODk3ODA3NywianRpIjoiX09hYm15ZWFSSTZ0NlpzczNRQ0djUSIsInNjb3BlIjoiYWRtaW4ifQ.xZKAXIKfVk2F35CO1luzi1fZnZgyWUM65m0FZ7h67RA';
    cy.fixture(fileName, 'binary').then(fileContent => {
      cy.request({
        method: 'POST',
        url: 'http://0.0.0.0:3340/projects/0803/assets/ingest/screen.png',
        headers: {
          Accept: 'application/json, text/plain, */*',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'X-Asset-Ingested': '1',
          Origin: 'http://localhost:4200',
          Referer: 'http://localhost:4200/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
        body: Cypress.Blob.binaryStringToBlob(fileContent, 'application/octet-stream'),
      }).then(response => {
        const json = JSON.parse(new TextDecoder().decode(response.body));
        console.log(response, response.body.internalFileName, json);

        cy.request({
          method: 'POST',
          url: 'http://0.0.0.0:3333/v2/resources',
          body: {
            '@type': 'http://0.0.0.0:3333/ontology/0803/incunabula/v2#Sideband',
            'http://www.w3.org/2000/01/rdf-schema#label': 'fff',
            'http://api.knora.org/ontology/knora-api/v2#attachedToProject': {
              '@id': 'http://rdfh.ch/projects/0803',
            },
            'http://0.0.0.0:3333/ontology/0803/incunabula/v2#sbTitle': {
              '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
              'http://api.knora.org/ontology/knora-api/v2#valueAsString': 'fff',
            },
            'http://api.knora.org/ontology/knora-api/v2#hasStillImageFileValue': {
              '@type': 'http://api.knora.org/ontology/knora-api/v2#StillImageFileValue',
              'http://api.knora.org/ontology/knora-api/v2#fileValueHasFilename': json['internalFilename'],
            },
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        expect(response.status).to.eq(200);
      });
    });
  });
});
