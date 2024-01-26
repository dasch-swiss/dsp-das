import { EventEmitter, Injectable, Output, inject, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApiResponseData,
  ApiResponseError,
  CredentialsResponse,
  KnoraApiConnection,
  LoginResponse,
  ReadUser,
  User,
} from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/shared/app-api';
import { Auth, DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import {
  ClearListsAction,
  ClearOntologiesAction,
  ClearOntologyClassAction,
  ClearProjectsAction,
  LoadUserAction,
  LogUserOutAction,
  UserSelectors,
  UserStateModel,
} from '@dasch-swiss/vre/shared/app-state';
import { Actions, Store, ofActionSuccessful, StateContext } from '@ngxs/store';
import { decode } from 'effect/Duration';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, take, takeLast, tap } from 'rxjs/operators';
import { AccessTokenService } from './access-token.service';
import { LoginError, ServerError } from './error';

@Injectable({ providedIn: 'root' })
export class OnLoadService {
  constructor(
    private _accessTokenService: AccessTokenService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private userApiService: UserApiService,
    private _store: Store
  ) {}
  onLoad() {
    const encodedJWT = this._accessTokenService.getTokenUser();
    if (!encodedJWT) {
      return;
    }

    const decodedToken = this._accessTokenService.decodedAccessToken(encodedJWT);
    if (!decodedToken || this._accessTokenService.isValidToken(decodedToken)) {
      this._accessTokenService.removeTokens();
      return;
    }
    console.log('decodedToken', decodedToken);

    this._dspApiConnection.v2.jsonWebToken = encodedJWT; // or decodedAccessToken ?
    this._dspApiConnection.v2.auth
      .checkCredentials()
      .pipe(
        take(1),
        tap(response => {
          if (response instanceof ApiResponseError) {
            throwError(response);
          }
        }),
        switchMap(() => this.userApiService.list()),
        map(users => {
          const usernameRegex = /\/users\/(\w+)$/;
          const match = decodedToken.sub.match(usernameRegex);

          if (!match) {
            throwError('Decoded user in JWT token is not valid.');
          }

          const username = match[1];
          const foundUser = users.users.find(user => user.username === username);

          if (!foundUser) {
            throwError('No user found from database.');
          }
          return foundUser as ReadUser;
        })
      )
      .subscribe(
        (user: User) => {},
        () => {
          this._accessTokenService.removeTokens();
        }
      );
    // return ctx.dispatch(new LoadProfile());
  }
}
