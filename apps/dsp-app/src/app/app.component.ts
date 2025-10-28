import { Component, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { PendoAnalyticsService } from '@dasch-swiss/vre/3rd-party-services/analytics';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { AutoLoginService, LocalStorageWatcherService } from '@dasch-swiss/vre/core/session';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet />
    <app-cookie-banner />
  `,
  standalone: false,
})
export class AppComponent {
  constructor(
    private _titleService: Title,
    private _autoLoginService: AutoLoginService,
    private _pendo: PendoAnalyticsService,
    private _localStorageWatcher: LocalStorageWatcherService,
    private _localizationService: LocalizationService,
    @Inject(DspApiConnectionToken)
    private readonly _dspApiConnection: KnoraApiConnection
  ) {
    this._dspApiConnection.v2.jsonWebToken = ''; // needed for JS-LIB to run
    this._pendo.setup();
    this._autoLoginService.setup();
    this._localStorageWatcher.watchAccessToken();
    this._titleService.setTitle('DaSCH Service Platform');
    this._localizationService.init();
  }
}
