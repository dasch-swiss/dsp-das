import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponseData, ApiResponseError, KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import {
  ClearListsAction,
  ClearOntologiesAction,
  ClearOntologyClassAction,
  ClearProjectsAction,
  LoadUserAction,
  LogUserOutAction,
} from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { AccessTokenService } from './access-token.service';
import { LoginError } from './error';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private store: Store,
    private _accessTokenService: AccessTokenService,
    private router: Router,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  isCredentialsValid$() {
    return this._dspApiConnection.v2.auth.checkCredentials().pipe(
      take(1),
      map(response => {
        if (response instanceof ApiResponseError) {
          throwError(response);
        }
        return true;
      }),
      catchError(() => {
        return of(false);
      })
    );
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
        this._dspApiConnection.v2.jsonWebToken = '';
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
