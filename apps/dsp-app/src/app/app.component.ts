import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
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
    private _localStorageWatcher: LocalStorageWatcherService,
    private _localizationService: LocalizationService
  ) {
    this._autoLoginService.setup();
    this._localStorageWatcher.watchAccessToken();
    this._titleService.setTitle('DaSCH Service Platform');
    this._localizationService.init();
  }
}
