describe('link a resource', () => {
    it('passes', () => {
        // Visit the main page
        cy.visit('http://localhost:4200/');
        /* ==== Generated with Cypress Studio ==== */
        cy.get(':nth-child(3) > .ng-tns-c617788805-4 > [data-cy="navigate-to-project-button"] > [data-cy="tile"] > .project-tile-content > .title > .title-text').click();
        cy.get('.mat-mdc-list-item-title > div').click();
        cy.get('#collaboration > .mdc-tab__content > .mdc-tab__text-label').click();
        cy.get(':nth-child(1) > .table-action > .mat-mdc-menu-trigger > .mat-mdc-button-touch-target').click();
        cy.get(':nth-child(4) > .mat-mdc-menu-item-text').click();
        cy.get('[data-cy="confirmation-button"] > .mdc-button__label').click();
        /* ==== End Cypress Studio ==== */
    })
})
