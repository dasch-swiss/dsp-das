import { Injectable } from '@angular/core';
import { Auth, LocalStorageLanguageKey } from '@dasch-swiss/vre/core/config';
import jwt_decode, { JwtPayload } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AccessTokenService {
  getAccessToken(): string | null {
    return localStorage.getItem(Auth.AccessToken);
  }

  storeToken(token: string): void {
    localStorage.setItem(Auth.AccessToken, token);
  }

  removeTokens(): void {
    localStorage.removeItem(Auth.AccessToken);
    localStorage.removeItem(Auth.Refresh_token);
    localStorage.removeItem(LocalStorageLanguageKey);
  }

  getTokenUser(): string | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    const decodedToken = this.decodedAccessToken(token);
    if (!decodedToken || !decodedToken.sub) {
      return null;
    }

    return decodedToken.sub;
  }

  decodedAccessToken(token: string): JwtPayload | null {
    try {
      return jwt_decode<JwtPayload>(token);
    } catch (e) {
      return null;
    }
  }

  isValidToken(decoded: JwtPayload): boolean {
    return !this._isTokenExpired(decoded) && decoded.sub !== undefined;
  }

  private _isTokenExpired(token: JwtPayload): boolean {
    const date = this._getTokenExpirationDate(token);
    if (date == null) {
      return false;
    }

    return date.getTime() < Date.now();
  }

  private _getTokenExpirationDate(decoded: JwtPayload): Date | null {
    if (decoded.exp === undefined) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);

    return date;
  }
}
