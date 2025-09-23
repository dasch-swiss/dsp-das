import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { AuthService, UserService } from '@dasch-swiss/vre/core/session';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MenuItem } from '../menu-item';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent implements OnInit, OnDestroy {
  destroyed: Subject<void> = new Subject<void>();

  navigation: MenuItem[];
  isLoggedIn$ = this._userService.isLoggedIn$;

  readonly systemLink = RouteConstants.system;
  user$ = this._userService.user$;
  isSysAdmin$ = this._userService.isSysAdmin$;

  constructor(
    private _authService: AuthService,
    private _userService: UserService,
    private _translateService: TranslateService
  ) {}

  ngOnInit() {
    this.setNav();
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  logout() {
    this._authService.logout();
  }

  private setNav() {
    this._translateService.onLangChange.pipe(takeUntil(this.destroyed)).subscribe(() => {
      this.navigation = [
        {
          label: this._translateService.instant('pages.userSettings.userMenu.home'),
          shortLabel: this._translateService.instant('pages.userSettings.userMenu.home'),
          route: RouteConstants.homeRelative,
          icon: '',
        },
        {
          label: this._translateService.instant('pages.userSettings.userMenu.myAccount'),
          shortLabel: this._translateService.instant('pages.userSettings.userMenu.myAccount'),
          route: RouteConstants.userAccountRelative,
          icon: '',
        },
      ];
    });
  }
}
