import { Inject, Injectable, OnDestroy } from '@angular/core';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { BehaviorSubject, finalize, Subscription, switchMap } from 'rxjs';
import { AccessTokenService } from './access-token.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AutoLoginService implements OnDestroy {
  hasCheckedCredentials$ = new BehaviorSubject(false);
  private _isInitialized = false;
  private _subscription?: Subscription;

  constructor(
    private readonly _accessTokenService: AccessTokenService,
    @Inject(DspApiConnectionToken)
    private readonly _dspApiConnection: KnoraApiConnection,
    private readonly _authService: AuthService
  ) {}

  setup(): void {
    if (this._isInitialized) {
      console.warn('AutoLoginService.setup() has already been called. Ignoring duplicate call.');
      return;
    }
    this._isInitialized = true;

    const encodedJWT = this._accessTokenService.getAccessToken();
    if (!encodedJWT) {
      this.hasCheckedCredentials$.next(true);
      return;
    }

    const decodedToken = this._accessTokenService.decodedAccessToken(encodedJWT);
    if (!decodedToken || !this._accessTokenService.isValidToken(decodedToken)) {
      this.hasCheckedCredentials$.next(true);
      this._accessTokenService.removeTokens();
      return;
    }

    this._dspApiConnection.v2.jsonWebToken = encodedJWT;

    this._subscription?.unsubscribe();
    this._subscription = this._authService
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

          return this._authService.afterSuccessfulLogin$(userIri, 'iri');
        }),
        finalize(() => this.hasCheckedCredentials$.next(true))
      )
      .subscribe({
        error: () => {
          this._authService.afterLogout();
        },
      });
  }

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
  }
}
