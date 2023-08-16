// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// before(() => {
//     cy.log('before all tests');
//     cy.visit('http://0.0.0.0:4200/');
//     cy.get('app-user-menu .login-button').click();
//     cy.get('#mat-input-0').click();
//     cy.get('#mat-input-0').type('root');
//     cy.get('#mat-input-1').type('test');
//     cy.get('div.cdk-overlay-container span.mdc-button__label span').click();
//     cy.contains('Login successful');
// });

beforeEach(() => {
    cy.readFile('/dsp-app/apps/dsp-app-e2e/cypress/fixtures/User_profiles.json').then((json) => {
        
        // read JSON data file
       });
    cy.log(Cypress.spec.relative);
    if(Cypress.spec.relative.startsWith('cypress/e2e/System_Admin')) {
        cy.log('Logging in as admin');
        cy.login('SystemAdmin_username', 'SystemAdmin_password');
        // the cookie name will differ depending on the environment
        cy.getCookie("KnoraAuthenticationGAXDALRQFYYDUMZTGMZQ9999").should('exist');
    }

    if(Cypress.spec.relative.startsWith('cypress/e2e/Project_Member')) {
        cy.log('Logging in as project member');
        cy.login('ProjectMember_username', 'ProjectMember_password');
        // the cookie name will differ depending on the environment
        cy.getCookie("KnoraAuthenticationGAXDALRQFYYDUMZTGMZQ9999").should('exist');
    }
});

afterEach(() => {
    cy.log('after each test');
    cy.get('app-user-menu .user-menu').click();
    cy.get('mat-list-item:last span.mdc-button__label > span').click();
    cy.get('app-user-menu span.mdc-button__label').click();
    cy.getCookie("KnoraAuthenticationGAXDALRQFYYDUMZTGMZQ9999").should('not.exist');
});
