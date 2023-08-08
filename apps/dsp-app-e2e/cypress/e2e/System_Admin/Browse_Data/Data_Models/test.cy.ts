// temporary test to test logging in as a system admin
describe('testing', () => {
    it('should click on create project button', () => {
        cy.visit('http://0.0.0.0:4200/');
        cy.get('.create-project-button button').click();
    });

});
