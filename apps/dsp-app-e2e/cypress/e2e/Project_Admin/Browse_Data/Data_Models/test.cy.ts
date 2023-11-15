describe('testing project admin', () => {
    xit('should click on create project button', () => {
        cy.visit('http://localhost:4200/');
        cy.get('.create-project-button').should('exist');
    });

});
