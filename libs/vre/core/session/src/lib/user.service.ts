import { Injectable } from '@angular/core';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { UserPermissions } from '@dasch-swiss/vre/shared/app-common';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user$ = new BehaviorSubject<ReadUser | null>(null);

  // Public observables
  user$ = this._user$.asObservable();
  isLoggedIn$ = this._user$.pipe(map(user => user !== null));
  isSysAdmin$ = this._user$.pipe(map(user => (user ? UserPermissions.hasSysAdminRights(user) : false)));
  userActiveProjects$ = this._user$.pipe(map(user => (user ? user.projects.filter(project => project.status) : [])));
  userInactiveProjects$ = this._user$.pipe(map(user => (user ? user.projects.filter(project => !project.status) : [])));

  constructor(private _userApiService: UserApiService) {}

  get currentUser(): ReadUser | null {
    return this._user$.value;
  }

  loadUser(identifier: string, idType: 'iri' | 'email' | 'username'): Observable<ReadUser> {
    return this._userApiService.get(identifier, idType).pipe(
      tap(response => {
        this._user$.next(response.user);
      }),
      map(response => response.user)
    );
  }

  logout(): void {
    this._user$.next(null);
  }
}
