import { Component } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { AuthService, UserService } from '@dasch-swiss/vre/core/session';
import { AbTestService } from '../../../../../data-browser/src/lib/resource-class-sidenav/ab-test.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent {
  readonly MY_PROFILE = RouteConstants.myProfile;

  isLoggedIn$ = this._userService.isLoggedIn$;

  readonly systemLink = RouteConstants.system;
  user$ = this._userService.user$;
  isSysAdmin$ = this._userService.isSysAdmin$;

  constructor(
    private _authService: AuthService,
    private _userService: UserService,
    public abTesting: AbTestService
  ) {}

  toggle() {
    this.abTesting.isFullNavigation = !this.abTesting.isFullNavigation;
    this.abTesting.resourceClasSelected = null;
  }

  logout() {
    this._authService.logout();
  }
}
