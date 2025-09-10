import { Component } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';

@Component({
  selector: 'app-header-logo',
  template: `
    <a class="logo" [routerLink]="homeLink">
      <mat-icon matPrefix svgIcon="dasch_mosaic_icon_color" />
    </a>
  `,
  styles: [
    `
      .logo {
        display: flex;
        padding-right: 12px;
        height: 100%;
        column-gap: 10px;
        cursor: pointer;

        .mat-icon {
          height: 48px;
          width: 48px;
        }
      }
    `,
  ],
})
export class HeaderLogoComponent {
  homeLink = RouteConstants.home;
}
