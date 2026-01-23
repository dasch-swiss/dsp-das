import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { filter, map, Observable, switchMap } from 'rxjs';
import { ProjectPageService } from './project-page.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectAdminGuard implements CanActivate {
  private readonly _userService = inject(UserService);
  private readonly _projectPageService = inject(ProjectPageService);
  private readonly _router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this._userService.isLoggedIn$.pipe(
      filter(isLoggedIn => isLoggedIn === true),
      switchMap(() => this._projectPageService.hasProjectAdminRights$),
      map(hasProjectAdminRights => {
        if (!hasProjectAdminRights) {
          return this._router.createUrlTree([RouteConstants.notAllowed]);
        }
        return true;
      })
    );
  }
}
