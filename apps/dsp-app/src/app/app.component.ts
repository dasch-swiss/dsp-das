import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { PendoAnalyticsService } from '@dasch-swiss/vre/3rd-party-services/analytics';
import { AutoLoginService, LocalStorageWatcherService } from '@dasch-swiss/vre/core/session';
import { HeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { CookieBannerComponent } from './cookie-banner.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, CookieBannerComponent],
})
export class AppComponent implements OnInit {
  constructor(
    private _titleService: Title,
    private _autoLoginService: AutoLoginService,
    private _pendo: PendoAnalyticsService,
    private _localStorageWatcher: LocalStorageWatcherService,
    private _localizationService: LocalizationService
  ) {
    this._pendo.setup();
    this._autoLoginService.setup();
    this._localStorageWatcher.watchAccessToken();
    this._titleService.setTitle('DaSCH Service Platform');
  }

  ngOnInit() {
    this._localizationService.init();
  }
}
