import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { catchError, map, Observable, of, take, tap } from 'rxjs';
import { ProjectPageService } from './project-page.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectPageGuard implements CanActivate {
  constructor(
    private _projectPageService: ProjectPageService,
    private _router: Router
  ) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const projectUuid = route.params[RouteConstants.uuidParameter];
    console.log('projectUUID from params', projectUuid);
    if (!projectUuid) {
      return of(this._routeTo404());
    }

    this._projectPageService.setup(projectUuid);

    return this._projectPageService.currentProject$.pipe(
      take(1),
      catchError(v => of(undefined)),
      tap(v => console.log('fetched project in guard', v, this._projectPageService)),
      map(project => (project?.id === this._projectPageService.currentProjectId ? true : this._routeTo404()))
    );
  }

  private _routeTo404() {
    return this._router.parseUrl('**');
  }
}
