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
import './commands';
import { UserProfiles } from '../models/user-profiles';

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
    let users: UserProfiles;
    cy.readFile('cypress/fixtures/user_profiles.json').then(
        (json: UserProfiles) => {
            // read JSON data file
            users = json;

            cy.log(Cypress.spec.relative);
            if (Cypress.spec.relative.startsWith('cypress/e2e/System_Admin')) {
                cy.log('Logging in as system admin');
                cy.login({
                    username: users.systemAdmin_username_root,
                    password: users.systemAdmin_password_root,
                });
            }

            if (
                Cypress.spec.relative.startsWith('cypress/e2e/Project_Member')
            ) {
                cy.log('Logging in as project member');
                cy.log(users.projectMember_username);
                cy.login({
                    username: users.projectMember_username,
                    password: users.projectMember_password
                });

                // the cookie name will differ depending on the environment
                cy.getCookie(
                    'KnoraAuthenticationGAXDALRQFYYDUMZTGMZQ9999'
                ).should('exist');
            }
        }
    );
});

// afterEach(() => {
//     cy.log('after each test');
//     // cy.logout();
// });
