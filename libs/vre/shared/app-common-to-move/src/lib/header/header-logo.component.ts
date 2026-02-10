import { Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';

@Component({
  selector: 'app-header-logo',
  imports: [MatIconModule, RouterModule, MatIconButton],
  template: `
    <a matIconButton [routerLink]="homeLink" style="transform: scale(1.1)">
      <mat-icon svgIcon="dasch_mosaic_icon_color" />
    </a>
  `,
})
export class HeaderLogoComponent {
  homeLink = RouteConstants.home;

  constructor(
    private readonly _domSanitizer: DomSanitizer,
    private readonly _matIconRegistry: MatIconRegistry
  ) {
    this._matIconRegistry.addSvgIcon(
      'dasch_mosaic_icon_color',
      this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/dasch-mosaic-icon-color.svg')
    );
  }
}
