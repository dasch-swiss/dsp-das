import { EventEmitter, Injectable, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponseData, ApiResponseError, CredentialsResponse, LoginResponse, User } from '@dasch-swiss/dsp-js';
import { Auth, DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import {
  ClearListsAction,
  ClearOntologiesAction,
  ClearOntologyClassAction,
  ClearProjectsAction,
  LoadUserAction,
  LogUserOutAction,
  UserSelectors,
} from '@dasch-swiss/vre/shared/app-state';
import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, take, takeLast, tap } from 'rxjs/operators';
import { AccessTokenService } from './access-token.service';
import { LoginError, ServerError } from './error';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _dspApiConnection = inject(DspApiConnectionToken);

  constructor(
    private store: Store,
    private _actions: Actions,
    private _accessTokenService: AccessTokenService,
    private router: Router // private intervalWrapper: IntervalWrapperService
  ) {
    // check if the (possibly) existing session is still valid and if not, destroy it
    this.isSessionValid$();
  }

  /**
   * validate intern session and check knora api credentials if necessary.
   * If a json web token exists, it doesn't mean that the knora api credentials are still valid.
   *
   */
  isSessionValid$(forceLogout: boolean = false): Observable<boolean> {
    // mix of checks with session.validation and this.authenticate
    const accessToken = this._accessTokenService.getAccessToken();
    if (accessToken) {
      this._dspApiConnection.v2.jsonWebToken = accessToken;

      // check if the session is still valid:
      if (false) {
        // TODO if (this._accessTokenService.isTokenExpired(accessToken)) {
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
        return of(true);
      }
    } else {
      // no session found; update knora api connection with empty jwt
      this._dspApiConnection.v2.jsonWebToken = '';

      const username = this.store.selectSnapshot(UserSelectors.username);
      if (username) {
        this.clearState();
      }

      if (forceLogout) {
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
      this._accessTokenService.storeToken(credentials.body.message);
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
   */
  login$(identifier: string, password: string) {
    const identifierType = identifier.indexOf('@') > -1 ? 'email' : 'username';
    return this._dspApiConnection.v2.auth.login(identifierType, identifier, password).pipe(
      tap(response => {
        // wrong credentials
        if (response.status === 401 || response.status === 403) {
          throwError(<LoginError>{
            type: 'login',
            status: response.status,
            msg: 'Wrong credentials',
          });
        }

        if (response instanceof ApiResponseData) {
          this._accessTokenService.storeToken(response.body.token);
        }
      }),
      switchMap(() => this.store.dispatch(new LoadUserAction(identifier)))
    );
  }

  doLogoutUser() {
    this._accessTokenService.removeTokens();

    this._dspApiConnection.v2.auth
      .logout()
      .pipe(switchMap(() => this.clearState()))
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  private clearState() {
    return this.store.dispatch([
      new LogUserOutAction(),
      new ClearProjectsAction(),
      new ClearListsAction(),
      new ClearOntologiesAction(),
      new ClearOntologyClassAction(),
    ]);
  }
}
