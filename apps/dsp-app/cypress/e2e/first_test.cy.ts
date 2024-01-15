describe('Visual Check for Projects on Home Page', () => {
  it('should load projects on the home page', () => {
    // Visit the home page
    cy.visit('/');

    // Assuming your projects are displayed within tiles with a specific class
    // You need to adjust the selector based on your actual HTML structure
    const projectTileSelector = 'app-project-tile';

    // Wait for the project tiles to be visible
    cy.get(projectTileSelector).should('be.visible');

    // Check that at least one project tile is present
    cy.get(projectTileSelector).should('have.length.greaterThan', 0);
  });
});
