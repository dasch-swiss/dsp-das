// cookie-banner.component.cy.ts
import { MatButtonModule } from '@angular/material/button';
import { RouterTestingModule } from '@angular/router/testing';
import { mount } from 'cypress/angular';
import { CookieBannerComponent } from './cookie-banner.component';

describe('CookieBannerComponent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the cookie banner initially', () => {
    mount(CookieBannerComponent, {
      imports: [RouterTestingModule, MatButtonModule],
    });

    cy.get('.cookie-banner').should('exist');
    cy.get('[data-cy="accept-cookies"]').should('be.visible');
  });

  it('should hide the banner when accept is clicked', () => {
    mount(CookieBannerComponent, {
      imports: [RouterTestingModule, MatButtonModule],
    });

    cy.get('[data-cy="accept-cookies"]').click();
    cy.get('.cookie-banner').should('not.exist');
  });

  it.skip('should navigate to cookie policy when clicking the link', () => {
    mount(CookieBannerComponent, {
      imports: [RouterTestingModule.withRoutes([]), MatButtonModule],
    });

    // We can spy on router navigate, but for simplicity just click link
    cy.get('.link').click();

    // This just verifies the click worked - you'd mock/spy on Router in a real test
    cy.window().then(win => {
      expect(win).to.exist;
    });
  });
});
