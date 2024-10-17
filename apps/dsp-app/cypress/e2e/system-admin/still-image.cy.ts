describe('Still Image', () => {
  it('display the image', () => {
    cy.visit('');
    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(3) > .ng-tns-c617788805-4 > [data-cy="navigate-to-project-button"] > [data-cy="tile"] > .project-tile-content > .title').click();
    cy.get(':nth-child(2) > app-ontology-class-item > .class-item-container > .content > .icon').click();
    cy.get('#mat-input-7').clear('t');
    cy.get('#mat-input-7').type('tt');
    cy.get('#mat-input-4').clear('t');
    cy.get('#mat-input-4').type('tt');
    cy.get('[style="text-align: center; padding: 16px; border: 1px solid black;"] > :nth-child(3)').click();
    cy.get('[data-cy="submit-button"] > .mdc-button__label').click();
    /* ==== End Cypress Studio ==== */
  });
});
