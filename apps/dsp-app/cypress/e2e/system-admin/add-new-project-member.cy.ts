describe('add new project member', () => {
    it('passes', () => {
        // Visit the main page
        cy.visit('http://localhost:4200/');
        /* ==== Generated with Cypress Studio ==== */
        cy.get(':nth-child(4) > .ng-tns-c617788805-4 > [data-cy="navigate-to-project-button"] > [data-cy="tile"] > .project-tile-content > .title > .title-text').click();
        cy.get('.mat-mdc-list-item-title > div').click();
        cy.get('#collaboration > .mdc-tab__content > .mdc-tab__text-label').click();
        cy.get('#mat-input-6').click();
        cy.get('#mat-option-15 > .mdc-list-item__primary-text').click();
        cy.get('.add-new > .mdc-button__label').click();
        cy.get('#mat-input-11').clear();
        cy.get('#mat-input-11').type('pmember');
        cy.get('#mat-input-12').clear('p');
        cy.get('#mat-input-12').type('pmember@mail.com');
        cy.get('.small-field > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix').click();
        cy.get('#mat-input-13').clear();
        cy.get('#mat-input-13').type('p');
        cy.get('#mat-input-14').clear();
        cy.get('#mat-input-14').type('member');
        cy.get('#mat-input-9').clear('A');
        cy.get('#mat-input-9').type('NewPassword2020');
        cy.get('#mat-input-10').clear('A');
        cy.get('#mat-input-10').type('NewPassword2020');
        cy.get('.mat-mdc-dialog-actions > .mdc-button--raised > .mdc-button__label').click();
        /* ==== End Cypress Studio ==== */
    })
})
