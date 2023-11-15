/// <reference types="cypress" />

import { User } from "../models/user-profiles";

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (user: User) => {
    cy.session(user, () => {
        cy.visit('http://localhost:4200/');
        cy.get('app-user-menu .login-button').click();
        cy.get('#mat-input-0').click();
        cy.get('#mat-input-0').type(user.username);
        cy.get('#mat-input-1').type(user.password);
        cy.get('div.cdk-overlay-container span.mdc-button__label span').click();
        cy.contains('Login successful');
        cy.get('.cookie-banner button').click();
    },
    {
        validate: () => {
            const session = localStorage.getItem('session');
            expect(session).to.exist;
        }
    });
});

Cypress.Commands.add('logout', () => {
    cy.get('app-user-menu .user-menu').click();
    cy.get('mat-list-item:last span.mdc-button__label > span').click();
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
