import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AppConfigService, DspConfig } from '@dasch-swiss/vre/core/config';

@Component({
  selector: 'app-header',
  template: `
    <mat-toolbar style="background: inherit; height: 56px; justify-content: space-between">
      <span style="display: flex; align-items: center">
        <app-header-logo />
        <h1 style="font-size: 18px">DaSCH Service Platform</h1>
      </span>
      <app-header-search />

      <app-header-right />
    </mat-toolbar>
  `,
  styles: [
    `
      :host {
        display: block;
        border-bottom: 1px solid #ebebeb;
        background-color: #fcfdff;
      }
    `,
  ],
})
export class HeaderComponent {
  session = false;

  dsp: DspConfig;

  constructor(
    private _appConfigService: AppConfigService,
    private _domSanitizer: DomSanitizer,
    private _matIconRegistry: MatIconRegistry
  ) {
    // create own logo icon to use them in mat-icons
    this._matIconRegistry.addSvgIcon(
      'dasch_mosaic_icon_color',
      this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/dasch-mosaic-icon-color.svg')
    );

    this.dsp = this._appConfigService.dspConfig;
  }
}
