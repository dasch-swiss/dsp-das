describe('link a resource', () => {
    it('passes', () => {
        // Visit the main page
        cy.visit('http://localhost:4200/');
        /* ==== Generated with Cypress Studio ==== */
        cy.get(':nth-child(2) > .ng-tns-c617788805-4 > [data-cy="navigate-to-project-button"] > [data-cy="tile"] > .project-tile-content > .title > .title-text').click();
        cy.get('.ng-tns-c1859850774-7 > :nth-child(12) > app-ontology-class-item > .class-item-container > .content > .icon > .mat-icon').click();
        cy.get('mat-label.ng-tns-c1205077789-17').click();
        cy.get('#mat-input-45').clear('M');
        cy.get('#mat-input-45').type('Max Miller');
        cy.get('#mat-mdc-form-field-label-8 > .ng-tns-c1205077789-19').click();
        cy.get('#mat-input-3').clear('M');
        cy.get('#mat-input-3').type('Miller');
        cy.get('#mat-input-5').clear('M');
        cy.get('#mat-input-5').type('Max');
        cy.get('[data-cy="submit-button"] > .mdc-button__label').click();
        /* ==== End Cypress Studio ==== */
        /* ==== Generated with Cypress Studio ==== */
        cy.get('#mat-expansion-panel-header-4 > .mat-content > .sidenav-panel-header > .mat-expansion-panel-header-title').click();
        cy.get('#mat-expansion-panel-header-4 > .mat-content > .sidenav-panel-header > .mat-expansion-panel-header-title').click();
        cy.get('.ng-tns-c1859850774-31 > :nth-child(2) > app-ontology-class-item > .class-item-container > .content > .icon > .mat-icon').click();
        cy.get('mat-label.ng-tns-c1205077789-83').click();
        cy.get('#mat-input-72').clear('T');
        cy.get('#mat-input-72').type('Testletter');
        cy.get('#mat-input-51').clear('T');
        cy.get('#mat-input-51').type('Testletter');

        cy.get(
            ':nth-child(3) > [style="flex: 1;"] > app-property-value-switcher > app-property-values > .property-value > app-property-value > [data-cy="property-value"] > [style="display: flex;"] > .item > app-link-switch.ng-star-inserted > app-link-value.ng-star-inserted > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
        ).click();

        cy.get(
            ':nth-child(3) > [style="flex: 1;"] > app-property-value-switcher > app-property-values > .property-value > app-property-value > [data-cy="property-value"] > [style="display: flex;"] > .item > app-link-switch.ng-star-inserted > app-link-value.ng-star-inserted > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix > [data-cy="link-input"]'
        ).clear();

        cy.get(
            ':nth-child(3) > [style="flex: 1;"] > app-property-value-switcher > app-property-values > .property-value > app-property-value > [data-cy="property-value"] > [style="display: flex;"] > .item > app-link-switch.ng-star-inserted > app-link-value.ng-star-inserted > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix > [data-cy="link-input"]'
        ).type('Max');

        cy.get('#mat-option-35').click();
        cy.get('[data-cy="submit-button"] > .mdc-button__label').click();
        cy.get('.ng-tns-c1859850774-112 > :nth-child(12) > app-ontology-class-item > .class-item-container > .content > .box > .mat-mdc-tooltip-trigger').click();
        /* ==== End Cypress Studio ==== */
    })
})
