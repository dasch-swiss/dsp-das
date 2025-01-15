import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { User } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { AuthService } from '@dasch-swiss/vre/shared/app-session';
import { UserSelectors } from '@dasch-swiss/vre/core/state';
import { TranslateService } from '@ngx-translate/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MenuItem } from '../menu-item';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

  destroyed: Subject<void> = new Subject<void>();

  navigation: MenuItem[];
  isLoggedIn$ = this._store.select(UserSelectors.isLoggedIn);

  readonly systemLink = RouteConstants.system;
  @Select(UserSelectors.user) user$: Observable<User>;
  @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<User>;

  constructor(
    private _authService: AuthService,
    private _store: Store,
    private _translateService: TranslateService
  ) {}

  ngOnInit() {
    this.isLoggedIn$.pipe(takeUntil(this.destroyed)).subscribe(isLoggedIn => {
      if (isLoggedIn && this.menuTrigger.menuOpen) {
        this.menuTrigger.closeMenu();
      }
    });

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
          label: this._translateService.instant('user.userMenu.home'),
          shortLabel: this._translateService.instant('user.userMenu.home'),
          route: RouteConstants.homeRelative,
          icon: '',
        },
        {
          label: this._translateService.instant('user.userMenu.myAccount'),
          shortLabel: this._translateService.instant('user.userMenu.myAccount'),
          route: RouteConstants.userAccountRelative,
          icon: '',
        },
      ];
    });
  }
}
