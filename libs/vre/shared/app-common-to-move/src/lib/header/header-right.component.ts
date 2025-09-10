import { Component } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';

@Component({
  selector: 'app-header-right',
  template: `
    <span>
      <a mat-button [routerLink]="helpLink">{{ 'ui.header.help' | translate }}</a>
      <app-user-menu />
    </span>
  `,
})
export class HeaderRightComponent {
  helpLink = RouteConstants.help;
}
