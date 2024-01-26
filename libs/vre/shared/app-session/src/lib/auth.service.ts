import { EventEmitter, Injectable, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ApiResponseData, ApiResponseError, CredentialsResponse, LoginResponse, User } from '@dasch-swiss/dsp-js';
import { Auth, DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import {
  ClearListsAction,
  ClearOntologiesAction,
  ClearOntologyClassAction,
  ClearProjectsAction,
  ClearUsersAction,
  LoadUserAction,
  UserSelectors,
} from '@dasch-swiss/vre/shared/app-state';
import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { Observable, fromEvent, of, throwError } from 'rxjs';
import { catchError, map, switchMap, take, takeLast, takeWhile, tap } from 'rxjs/operators';
import { LoginError, ServerError } from './error';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenRefreshIntervalId: any;
  private _dspApiConnection = inject(DspApiConnectionToken);

  get tokenUser() {
    return this.getTokenUser();
  }

  @Output() loginSuccessfulEvent = new EventEmitter<User>();

  constructor(
    private store: Store,
    private _actions: Actions,
    private router: Router // private intervalWrapper: IntervalWrapperService
  ) {
    // check if the (possibly) existing session is still valid and if not, destroy it
    this.isSessionValid$();
    fromEvent(window, 'storage').pipe(takeUntilDestroyed()).subscribe(); // detect if auth token has been changed by other browser window

    // if (this.isLoggedIn()) {
    //     this.startTokenRefresh();
    // }
  }

  /**
   * validate intern session and check knora api credentials if necessary.
   * If a json web token exists, it doesn't mean that the knora api credentials are still valid.
   *
   */
  isSessionValid$(forceLogout: boolean = false): Observable<boolean> {
    // mix of checks with session.validation and this.authenticate
    const accessToken = this.getAccessToken();
    const username = this.store.selectSnapshot(UserSelectors.username);
    if (accessToken) {
      this._dspApiConnection.v2.jsonWebToken = accessToken;

      // check if the session is still valid:
      if (this.isTokenExpired(accessToken)) {
        // the internal session has expired
        // check if the api credentials are still valid
        return this._dspApiConnection.v2.auth.checkCredentials().pipe(
          map((credentials: ApiResponseData<CredentialsResponse> | ApiResponseError) =>
            this._updateSessionId(credentials)
          ),
          catchError(() => {
            // if there is any error checking the credentials (mostly a 401 for after
            // switching the server where this session/the credentials are unknown), we destroy the session
            // so a new login is required
            this.doLogoutUser();
            return of(false);
          })
        );
      } else {
        // the internal session is still valid
        if (!username) {
          const jwtData = jwt_decode<JwtPayload>(accessToken);
          const jwtUsername = jwtData.sub?.split('/').pop();
          if (!jwtUsername) {
            return of(false);
          }

          this.store
            .select(UserSelectors.isLoading)
            .pipe(takeWhile(isLoading => isLoading === false))
            .pipe(take(1))
            .subscribe(() => this.store.dispatch(new LoadUserAction(jwtUsername)));
        }

        return of(true);
      }
    } else {
      // no session found; update knora api connection with empty jwt
      this._dspApiConnection.v2.jsonWebToken = '';

      if (username || forceLogout) {
        this.doLogoutUser();
      }

      return of(false);
    }
  }

  /**
   * updates the id of the current session in the local storage
   * @param credentials response from getCredentials method call
   * @param session the current session
   * @param timestamp timestamp in form of a number
   */
  private _updateSessionId(credentials: ApiResponseData<CredentialsResponse> | ApiResponseError): boolean {
    if (credentials instanceof ApiResponseData) {
      // the dsp api credentials are still valid
      this.storeToken(credentials.body.message);
      return true;
    } else {
      // a user is not authenticated anymore!
      this.doLogoutUser();
      return false;
    }
  }

  /**
   * Login user
   * @param identifier can be the email or the username
   * @param password the password of the user
   * @returns an Either with the session or an error message
   */
  apiLogin$(identifier: string, password: string): Observable<boolean> {
    const identifierType: 'iri' | 'email' | 'username' = identifier.indexOf('@') > -1 ? 'email' : 'username';
    return this._dspApiConnection.v2.auth.login(identifierType, identifier, password).pipe(
      takeLast(1),
      tap((response: ApiResponseData<LoginResponse> | ApiResponseError) => {
        if (response instanceof ApiResponseData) {
          this.storeToken(response.body.token);
        }
      }),
      switchMap((response: ApiResponseData<LoginResponse> | ApiResponseError) => {
        if (response instanceof ApiResponseData) {
          return of(true);
        } else if (response.status === 401 || response.status === 403) {
          // wrong credentials
          return throwError(<LoginError>{
            type: 'login',
            status: response.status,
            msg: 'Wrong credentials',
          });
        } else {
          // server error
          return throwError(<ServerError>{
            type: 'server',
            status: response.status,
            msg: 'Server error',
          });
        }
      })
    );
  }

  // TODO refresh access token using API
  refreshToken$(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of(false);
    }

    return of(false);
  }

  logout() {
    // TODO ? logout by access token missing ?
    this._dspApiConnection.v2.auth
      .logout()
      .pipe(
        take(1),
        catchError((error: ApiResponseError) => of(error?.status === 200))
      )
      .subscribe((response: any) => {
        if (!(response instanceof ApiResponseData)) {
          throwError(<ServerError>{
            type: 'server',
            status: response.status,
            msg: 'Logout was not successful',
          });
          return;
        }

        if (response.body.status === 0) {
          this.doLogoutUser();
        }
      });
  }

  doLogoutUser() {
    this.removeTokens();
    this._actions
      .pipe(ofActionSuccessful(ClearProjectsAction))
      .pipe(take(1))
      .subscribe(() =>
        this.router
          .navigate([RouteConstants.logout], { skipLocationChange: true })
          .then(() => this.router.navigate([RouteConstants.home]))
      );
    this.clearState();
    clearTimeout(this.tokenRefreshIntervalId);
  }

  clearState() {
    this.store.dispatch([
      new ClearUsersAction(),
      new ClearProjectsAction(),
      new ClearListsAction(),
      new ClearOntologiesAction(),
      new ClearOntologyClassAction(),
    ]);
  }

  isLoggedIn() {
    return !!this.getAccessToken();
  }

  getAccessToken() {
    return localStorage.getItem(Auth.AccessToken);
  }

  getRefreshToken() {
    return localStorage.getItem(Auth.Refresh_token);
  }

  private storeToken(token: string) {
    localStorage.setItem(Auth.AccessToken, token);
    // localStorage.setItem(this.REFRESH_TOKEN, token);
    this.startTokenRefresh();
  }

  private refreshAccessToken(access_token: string) {
    localStorage.setItem(Auth.AccessToken, access_token);
    this.startTokenRefresh();
  }

  private removeTokens() {
    localStorage.removeItem(Auth.AccessToken);
    localStorage.removeItem(Auth.Refresh_token);
  }

  isTokenExpired(token?: string | null): boolean {
    if (!token) {
      token = this.getAccessToken();
    }

    if (!token) {
      return true;
    }

    const date = this.getTokenExpirationDate(token);
    if (date == null) {
      return false;
    }

    return date.setSeconds(date.getSeconds() - 30).valueOf() <= new Date().valueOf();
  }

  getTokenExpirationDate(token: string): Date | null {
    const decoded = jwt_decode<JwtPayload>(token);

    if (decoded.exp === undefined) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);

    return date;
  }

  getTokenExp(token: string): number {
    const decoded = jwt_decode<JwtPayload>(token);

    if (decoded.exp === undefined) {
      return 0;
    }

    return decoded.exp;
  }

  startTokenRefresh() {
    const token = this.getAccessToken();

    if (!token) {
      return;
    }

    const exp = this.getTokenExp(token);
    const date = new Date(0);
    date.setUTCSeconds(exp);

    if (this.tokenRefreshIntervalId) {
      clearInterval(this.tokenRefreshIntervalId);
    }
  }

  private getTokenUser(): string {
    const token = this.getAccessToken();
    if (!token) {
      return '';
    }

    const decoded = jwt_decode<JwtPayload>(token);
    if (decoded.sub === undefined) {
      return '';
    }

    return decoded.sub;
  }
}
