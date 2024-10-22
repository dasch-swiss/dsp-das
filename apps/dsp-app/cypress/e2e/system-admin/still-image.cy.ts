import StillImagePage from '../../support/pages/still-image.page';

function assessToolbarVisibility() {
  cy.log('Assess toolbar visibility');
  cy.get('[data-cy="still-image-share-button"]').should('be.visible');
  cy.get('[data-cy="still-image-settings-button"]').should('be.visible');
  cy.get('[data-cy="zoom-out"]').should('be.visible');
  cy.get('[data-cy="zoom-in"]').should('be.visible');
  cy.get('[data-cy="still-image-download-button"]').should('be.visible');
  cy.get('[data-cy="still-image-region-button"]').should('be.visible');
  cy.get('[data-ci="zoom-reset"]').should('be.visible');
  cy.get('[data-ci="fullscreen"]').should('be.visible');
}

describe('Still image', () => {
  const color = { hex: '#65ff33', rgb: 'rgb(101, 255, 51)' };
  it('can see the image with the reader, the toolbar is visible, display a region and click', () => {
    const page = new StillImagePage();
    page.init();

    const moreButton = cy.get('[data-cy="more-vert-image-button"]');
    moreButton.should('be.visible');
    assessToolbarVisibility();

    const region = cy.get('[data-cy="annotation-rectangle"]');
    region.should('have.css', 'outline-color', color.rgb);
    region.click();
    cy.get('[data-cy="property-header"]').should('contain', page.label);

    cy.log('Click on the more button');
    moreButton.click();
    cy.get('[data-cy="open-iiif-new-tab"]')
      .should('be.visible')
      .should('have.attr', 'href')
      .and('match', /http:\/\/0\.0\.0\.0:1024\/0803\/.*\/full\/2002,1104\/0\/default\.jpg/);
    cy.get('body').click(0, 0); // click outside
  });
});
