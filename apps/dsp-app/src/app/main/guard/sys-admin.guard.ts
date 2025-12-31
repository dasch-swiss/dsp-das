import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { AutoLoginService, UserService } from '@dasch-swiss/vre/core/session';
import { filter, Observable, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SysAdminGuard implements CanActivate {
  private readonly _autoLoginService = inject(AutoLoginService);
  private readonly _userService = inject(UserService);
  private readonly _router = inject(Router);

  canActivate(): Observable<boolean> {
    return this._autoLoginService.hasCheckedCredentials$.pipe(
      filter(hasChecked => hasChecked === true),
      switchMap(() => this._userService.isSysAdmin$),
      tap(isSysAdmin => {
        if (!isSysAdmin) {
          this._router.navigate([RouteConstants.home]);
        }
      })
    );
  }
}
