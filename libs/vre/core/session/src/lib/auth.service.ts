import { Inject, Injectable } from '@angular/core';
import { ApiResponseError, KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserFeedbackError } from '@dasch-swiss/vre/core/error-handler';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AccessTokenService } from './access-token.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly _userService: UserService,
    private _translateService: TranslateService,
    private readonly _accessTokenService: AccessTokenService,
    @Inject(DspApiConnectionToken)
    private readonly _dspApiConnection: KnoraApiConnection,
    private readonly _localizationsService: LocalizationService
  ) {}

  isCredentialsValid$() {
    return this._dspApiConnection.v2.auth.checkCredentials().pipe(
      map(() => true),
      catchError(() => {
        return of(false);
      })
    );
  }

  /**
   * Complete authentication by loading user and setting language preferences
   * @param identifierOrIri can be email, username, or user IRI
   * @param identifierType type of identifier: 'email', 'username', or 'iri'
   */
  afterSuccessfulLogin$(identifierOrIri: string, identifierType: 'email' | 'username' | 'iri') {
    return this._userService.loadUser(identifierOrIri, identifierType).pipe(
      tap(user => {
        this._localizationsService.setLanguage(user.lang);
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
        const encodedJWT = response.body.token;
        this._accessTokenService.storeToken(encodedJWT);
        this._dspApiConnection.v2.jsonWebToken = encodedJWT;
      }),
      catchError(error => {
        if ((error instanceof ApiResponseError && error.status === 400) || error.status === 401) {
          throw new UserFeedbackError(this._translateService.instant('core.auth.invalidCredentials'));
        }
        throw error;
      }),
      switchMap(() => this.afterSuccessfulLogin$(identifier, identifierType))
    );
  }

  /**
   * Cleanup authentication state with configurable options
   * @param options cleanup configuration
   * @param options.clearJwt whether to clear JWT token from connection (default: true)
   * @param options.reloadPage whether to reload the page (default: false)
   */
  afterLogout(): void {
    this._userService.logout();
    this._accessTokenService.removeTokens();
    this._dspApiConnection.v2.jsonWebToken = '';
  }

  /**
   * Logout user - performs API logout and full cleanup
   */
  logout() {
    this._dspApiConnection.v2.auth.logout().subscribe(() => {
      this.afterLogout();
      window.location.reload();
    });
  }
}
