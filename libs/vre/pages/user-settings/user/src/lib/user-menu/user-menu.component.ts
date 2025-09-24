import { Component } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { AuthService, UserService } from '@dasch-swiss/vre/core/session';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent {
  isLoggedIn$ = this._userService.isLoggedIn$;

  readonly systemLink = RouteConstants.system;
  user$ = this._userService.user$;
  isSysAdmin$ = this._userService.isSysAdmin$;

  constructor(
    private _authService: AuthService,
    private _userService: UserService
  ) {}

  logout() {
    this._authService.logout();
  }
}
