import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { filter, Observable, switchMap, tap } from 'rxjs';
import { ProjectPageService } from './project-page.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectAdminGuard implements CanActivate {
  private readonly _userService = inject(UserService);
  private readonly _projectPageService = inject(ProjectPageService);
  private readonly _router = inject(Router);

  canActivate(): Observable<boolean> {
    return this._userService.isLoggedIn$.pipe(
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          this._router.navigate([RouteConstants.home]);
        }
      }),
      filter(isLoggedIn => isLoggedIn === true),
      switchMap(() => this._projectPageService.hasProjectAdminRights$),
      tap(hasProjectAdminRights => {
        if (!hasProjectAdminRights) {
          this._router.navigate([RouteConstants.home]);
        }
      })
    );
  }
}
