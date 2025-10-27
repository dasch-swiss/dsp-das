import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { BehaviorSubject, finalize, switchMap } from 'rxjs';
import { AccessTokenService } from './access-token.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AutoLoginService {
  hasCheckedCredentials$ = new BehaviorSubject(false);

  constructor(
    private readonly _accessTokenService: AccessTokenService,
    @Inject(DspApiConnectionToken)
    private readonly _dspApiConnection: KnoraApiConnection,
    private readonly _authService: AuthService
  ) {}

  setup(): void {
    this._dspApiConnection.v2.jsonWebToken = ''; // needed for JS-LIB to run

    const encodedJWT = this._accessTokenService.getAccessToken();
    if (!encodedJWT) {
      this.hasCheckedCredentials$.next(true);
      return;
    }

    const decodedToken = this._accessTokenService.decodedAccessToken(encodedJWT);
    if (!decodedToken || this._accessTokenService.isValidToken(decodedToken)) {
      this.hasCheckedCredentials$.next(true);
      this._authService.cleanupAuthState({ clearJwt: false });
      return;
    }

    this._dspApiConnection.v2.jsonWebToken = encodedJWT;

    this._authService
      .isCredentialsValid$()
      .pipe(
        switchMap(isValid => {
          if (!isValid) {
            throw new AppError('Credentials not valid');
          }

          const userIri = decodedToken.sub;
          if (!userIri) {
            throw new AppError('Decoded user in JWT token is not valid.');
          }

          return this._authService.completeAuthentication$(userIri, 'iri');
        }),
        finalize(() => this.hasCheckedCredentials$.next(true))
      )
      .subscribe({
        error: () => {
          this._authService.cleanupAuthState();
        },
      });
  }
}
