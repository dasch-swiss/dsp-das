// temporary test to test logging in as a project member
// you will need a user with the username 'projectMember' and the password 'test1234' in your local db
describe('testing', () => {
    it('should click on create project button', () => {
        cy.visit('http://localhost:4200/');
        cy.get('.create-project-button button').should('not.exist');
    });

});
