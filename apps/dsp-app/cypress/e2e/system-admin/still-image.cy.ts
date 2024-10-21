describe('File Upload Test', () => {
  let resourceId: string;

  beforeEach(() => {
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
          Origin: 'http://localhost:4200',
          Referer: 'http://localhost:4200/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
        body: Cypress.Blob.binaryStringToBlob(fileContent, 'application/octet-stream'),
      }).then(response => {
        const json = JSON.parse(new TextDecoder().decode(response.body));

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
            'X-Asset-Ingested': '1',
          },
        }).then(v => {
          resourceId = v.body['@id'];
        });
      });
    });
    cy.visit('/project/0803/ontology/incunabula/Sideband');
  });
  it('can see the image with the reader', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-cy="more-vert-image-button"]').should('be.visible');
    cy.get('[data-cy="still-image-share-button"]').should('be.visible');
    cy.get('[data-cy="still-image-settings-button"]').should('be.visible');
    cy.get('[data-cy="zoom-out"]').should('be.visible');
    cy.get('[data-cy="zoom-in"]').should('be.visible');
    cy.get('[data-cy="still-image-download-button"]').should('be.visible');
    cy.get('[data-cy="still-image-region-button"]').should('be.visible');
    cy.get('[data-ci="zoom-reset"]').should('be.visible');
    cy.get('[data-ci="fullscreen"]').should('be.visible');
  });

  it.only('can display region on the image, and display it on click', () => {
    const label = 'mylabel';
    const color = '#65ff33';
    cy.request({
      method: 'POST',
      url: 'http://0.0.0.0:3333/v2/resources',
      body: {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#Region',
        'http://www.w3.org/2000/01/rdf-schema#label': label,
        'http://api.knora.org/ontology/knora-api/v2#attachedToProject': {
          '@id': 'http://rdfh.ch/projects/0803',
        },
        'http://api.knora.org/ontology/knora-api/v2#hasColor': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#ColorValue',
          'http://api.knora.org/ontology/knora-api/v2#colorValueAsColor': color,
        },
        'http://api.knora.org/ontology/knora-api/v2#isRegionOfValue': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#LinkValue',
          'http://api.knora.org/ontology/knora-api/v2#linkValueHasTargetIri': {
            '@id': resourceId,
          },
        },
        'http://api.knora.org/ontology/knora-api/v2#hasGeometry': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#GeomValue',
          'http://api.knora.org/ontology/knora-api/v2#geometryValueAsGeometry':
            '{"status":"active","lineColor":"#65ff33","lineWidth":2,"points":[{"x":0.561919720794521,"y":0.5578800679215781},{"x":0.301563296862811,"y":0.8720048255452515}],"type":"rectangle"}',
        },
      },
    }).then(() => {
      cy.get('[data-cy="annotation-rectangle"]').click();
      cy.get('[data-cy="property-header"]').should('contain', label);
    });
  });
});
