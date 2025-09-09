import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatList, MatListItem } from '@angular/material/list';
import { MatMenuTrigger, MatMenu } from '@angular/material/menu';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { User } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { AuthService, UserService } from '@dasch-swiss/vre/core/session';
import { AdminImageDirective } from '@dasch-swiss/vre/ui/ui';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LoginFormComponent } from '../login-form/login-form.component';
import { MenuItem } from '../menu-item';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  standalone: true,
  imports: [
    MatButton,
    MatMenuTrigger,
    AdminImageDirective,
    MatMenu,
    MatList,
    MatListItem,
    RouterLinkActive,
    RouterLink,
    MatDivider,
    LoginFormComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
export class UserMenuComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

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
