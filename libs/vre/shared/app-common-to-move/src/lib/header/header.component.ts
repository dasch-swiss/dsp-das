import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppConfigService, DspConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { SearchParams } from '../search-params.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  session = false;
  searchParams?: SearchParams;
  helpLink = RouteConstants.help;

  dsp: DspConfig;

  homeLink = RouteConstants.home;

  constructor(
    private _appConfigService: AppConfigService,
    private _domSanitizer: DomSanitizer,
    private _matIconRegistry: MatIconRegistry,
    private _router: Router
  ) {
    // create own logo icon to use them in mat-icons
    this._matIconRegistry.addSvgIcon(
      'dasch_mosaic_icon_color',
      this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/dasch-mosaic-icon-color.svg')
    );

    this.dsp = this._appConfigService.dspConfig;
  }

  doSearch(search: SearchParams) {
    // reset search params
    this.searchParams = undefined;

    // we can do the routing here or send the search param
    // to (resource) list view directly
    this.searchParams = search;

    if (this.searchParams.mode && this.searchParams.query) {
      let doSearchRoute = `/${RouteConstants.search}/${this.searchParams.mode}/${this.searchParams.query}`;

      if (this.searchParams.filter && this.searchParams.filter.limitToProject) {
        doSearchRoute += `/${encodeURIComponent(this.searchParams.filter.limitToProject)}`;
      }

      this._router.navigateByUrl('/').then(() => this._router.navigate([doSearchRoute]));
    }
  }
}
