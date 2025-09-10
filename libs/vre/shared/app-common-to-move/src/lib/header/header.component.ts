import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppConfigService, DspConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { SearchParams } from '../search-params.interface';

@Component({
  selector: 'app-header',
  template: `
    <mat-toolbar class="toolbar-header">
      <app-header-logo />
      <span style="flex: 1; display: flex; align-items: center">
        <span class="title-container">Dasch Service Platform</span>
      </span>

      @if (false) {
        <app-search-panel [projectfilter]="true" [advanced]="true" [expert]="true" (search)="doSearch($event)" />
      }

      <app-header-right />
    </mat-toolbar>
  `,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  session = false;
  searchParams?: SearchParams;

  dsp: DspConfig;

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
