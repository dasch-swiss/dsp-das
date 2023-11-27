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

// do things here before each test if needed
// All active session data (cookies, localStorage and sessionStorage) across all domains are cleared.
beforeEach(() => {
    let users: UserProfiles;
    cy.readFile('cypress/fixtures/user_profiles.json').then(
        (json: UserProfiles) => {
            // read JSON data file
            users = json;

            if (Cypress.spec.relative.startsWith('cypress/e2e/System_Admin')) {
                cy.login({
                    username: users.systemAdmin_username_root,
                    password: users.systemAdmin_password_root,
                });
            }

            if (
                Cypress.spec.relative.startsWith('cypress/e2e/Project_Member')
            ) {
                cy.login({
                    username: users.projectMember_username,
                    password: users.projectMember_password
                });
            }
        }
    );
});

// do things here after each test if needed
// afterEach(() => {
// });
