describe('File Upload Test', () => {
  it('Uploads a file via HTTP POST request', () => {
    const fileName = 'assets/screen.png'; // Your file path

    const token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIwLjAuMC4wOjMzMzMiLCJzdWIiOiJodHRwOi8vcmRmaC5jaC91c2Vycy9yb290IiwiYXVkIjpbIktub3JhIiwiU2lwaSIsImh0dHA6Ly9sb2NhbGhvc3Q6MzM0MCJdLCJleHAiOjE3MzE1NzAwNzcsImlhdCI6MTcyODk3ODA3NywianRpIjoiX09hYm15ZWFSSTZ0NlpzczNRQ0djUSIsInNjb3BlIjoiYWRtaW4ifQ.xZKAXIKfVk2F35CO1luzi1fZnZgyWUM65m0FZ7h67RA';
    cy.fixture(fileName, 'binary').then(fileContent => {
      cy.request({
        method: 'POST',
        url: 'http://0.0.0.0:3340/projects/0803/assets/ingest/Screenshot%202024-10-16%20at%2014.50.14.png',
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
        // Assert the response
        console.log(response);
        expect(response.status).to.eq(200);
      });
    });
  });
});
