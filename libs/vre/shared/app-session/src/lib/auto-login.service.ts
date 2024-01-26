import { Inject, Injectable } from '@angular/core';
import { ApiResponseError, KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { LoadUserAction } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { throwError } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { AccessTokenService } from './access-token.service';

@Injectable({ providedIn: 'root' })
export class AutoLoginService {
  constructor(
    private _accessTokenService: AccessTokenService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _store: Store
  ) {}

  setup() {
    const encodedJWT = this._accessTokenService.getTokenUser();
    if (!encodedJWT) {
      return;
    }

    const decodedToken = this._accessTokenService.decodedAccessToken(encodedJWT);
    if (!decodedToken || this._accessTokenService.isValidToken(decodedToken)) {
      this._accessTokenService.removeTokens();
      return;
    }

    this._dspApiConnection.v2.jsonWebToken = encodedJWT;
    this._dspApiConnection.v2.auth
      .checkCredentials()
      .pipe(
        take(1),
        tap(response => {
          if (response instanceof ApiResponseError) {
            throwError(response);
          }
        }),
        switchMap(() => {
          const usernameRegex = /\/users\/(\w+)$/;
          const match = decodedToken.sub.match(usernameRegex);

          if (!match || !match[1]) {
            throwError('Decoded user in JWT token is not valid.');
          }

          const username = (match as RegExpMatchArray)[1];
          return this._store.dispatch(new LoadUserAction(username));
        })
      )
      .subscribe({
        error: () => {
          this._accessTokenService.removeTokens();
        },
      });
  }
}
