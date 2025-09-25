import { Component } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';

@Component({
  selector: 'app-header-right',
  template: `
    <span style="display: flex; align-items: center; gap: 8px">
      <app-version-badge />
      <a mat-button [routerLink]="['/', HELP_LINK]">{{ 'ui.header.help' | translate }}</a>
      <app-user-menu />
    </span>
  `,
})
export class HeaderRightComponent {
  HELP_LINK = RouteConstants.help;
}
