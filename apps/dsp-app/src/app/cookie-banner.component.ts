import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cookie-banner',
  template: ` @if (showCookieBanner) {
    <div class="container">
      <p>
        {{ 'app.cookieBanner.message' | translate }}
        <a [routerLink]="RouteConstants.cookiePolicy">{{ 'app.cookieBanner.useOfCookies' | translate }}</a
        >.
      </p>
      <button matButton="filled" (click)="closeCookieBanner()" data-cy="accept-cookies">
        {{ 'app.cookieBanner.accept' | translate }}
      </button>
    </div>
  }`,
  styleUrls: [`./cookie-banner.component.scss`],
  imports: [MatButtonModule, TranslatePipe, RouterLink],
})
export class CookieBannerComponent implements OnInit {
  showCookieBanner = true;

  ngOnInit() {
    if (localStorage.getItem('cookieBanner') === null) {
      localStorage.setItem('cookieBanner', JSON.stringify(this.showCookieBanner));
    } else {
      this.showCookieBanner = JSON.parse(localStorage.getItem('cookieBanner'));
    }
  }

  closeCookieBanner() {
    this.showCookieBanner = false;
    localStorage.setItem('cookieBanner', JSON.stringify(this.showCookieBanner));
  }

  protected readonly RouteConstants = RouteConstants;
}
