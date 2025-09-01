import { Injectable } from '@angular/core';
import { Constants, ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { UserPermissions } from '@dasch-swiss/vre/shared/app-common';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user$ = new BehaviorSubject<ReadUser | null>(null);
  private _userProjectGroups$ = new BehaviorSubject<string[]>([]);
  private _isMemberOfSystemAdminGroup$ = new BehaviorSubject<boolean>(false);

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

  /**
   * Load user by identifier
   */
  loadUser(identifier: string, idType: 'iri' | 'email' | 'username'): Observable<ReadUser> {
    return this._userApiService.get(identifier, idType).pipe(
      tap(response => {
        this._user$.next(response.user);
        this._setUserProjectGroups(response.user);
      }),
      map(response => response.user)
    );
  }

  /**
   * Set user data
   */
  setUser(user: ReadUser): void {
    if (!user) return;

    const currentUser = this._user$.value;
    if (currentUser && currentUser.id === user.id) {
      this._user$.next(user);
    }

    this._setUserProjectGroups(user);
  }

  /**
   * Log out user - clear all user data
   */
  logout(): void {
    this._user$.next(null);
    this._userProjectGroups$.next([]);
    this._isMemberOfSystemAdminGroup$.next(false);
  }

  /**
   * Check if user has project admin rights for a specific project
   */
  hasProjectAdminRights(projectIri: string): Observable<boolean> {
    return this._user$.pipe(
      map(user => {
        if (!user || !user.permissions.groupsPerProject) {
          return false;
        }
        return UserPermissions.hasProjectAdminRights(user, projectIri);
      })
    );
  }

  /**
   * Check if user is member of a project
   */
  isProjectMember(projectIri: string): Observable<boolean> {
    return this._userProjectGroups$.pipe(
      map(groups => groups.some(groupIri => this._isSameProject(groupIri, projectIri)))
    );
  }

  /**
   * Private method to set user project groups
   */
  private _setUserProjectGroups(user: ReadUser): void {
    let isMemberOfSystemAdminGroup = false;
    const userProjectGroups: string[] = [];

    const groupsPerProject = user.permissions.groupsPerProject;

    if (groupsPerProject) {
      const groupsPerProjectKeys: string[] = Object.keys(groupsPerProject);

      for (const key of groupsPerProjectKeys) {
        if (key === Constants.SystemProjectIRI) {
          // is sysAdmin
          isMemberOfSystemAdminGroup = groupsPerProject[key].indexOf(Constants.SystemAdminGroupIRI) > -1;
        }

        if (groupsPerProject[key].indexOf(Constants.ProjectAdminGroupIRI) > -1) {
          // projectAdmin + projectMember
          userProjectGroups.push(key);
        } else {
          // projectMember
          userProjectGroups.push(key);
        }
      }
    }

    const currentUser = this._user$.value;
    if (currentUser?.username === user.username) {
      this._userProjectGroups$.next(userProjectGroups);
      this._isMemberOfSystemAdminGroup$.next(isMemberOfSystemAdminGroup);
    }
  }

  /**
   * Helper method to compare project IRIs (considering UUID conversion)
   */
  private _isSameProject(groupIri: string, projectIri: string): boolean {
    // This would need the ProjectService.IriToUuid logic if needed
    // For now, direct comparison
    return groupIri === projectIri;
  }
}
