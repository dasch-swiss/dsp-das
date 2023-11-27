/// <reference types="cypress" />

import { User } from "../models/user-profiles";

Cypress.Commands.add('login', (user: User) => {
    cy.session(user, () => {

        cy.request({
            method: 'POST',
            url: `${Cypress.env("apiUrl")}/v2/authentication`,
            body: {
                username: user.username,
                password: user.password
            }
        }).then((response) => {
            const session = {
                id: 123456789,
                user: {
                    name: "root",
                    jwt: response.body.token,
                    lang: "de",
                    sysAdmin: true,
                    projectAdmin: []
                }

            };

            localStorage.setItem('session', JSON.stringify(session));
            localStorage.setItem('cookieBanner', 'false');
            cy.visit('/');
            cy.get('rn-banner').shadow().find('.rn-close-btn').click();
        });
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
