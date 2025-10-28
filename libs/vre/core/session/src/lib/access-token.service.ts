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

  private isTokenExpired(token: JwtPayload): boolean {
    const date = this.getTokenExpirationDate(token);
    if (date == null) {
      return false;
    }

    // Token is expired if expiration time (minus 30s buffer) is in the past
    const expirationWithBuffer = date.getTime() - 30 * 1000; // 30 seconds buffer
    return expirationWithBuffer <= Date.now();
  }

  private getTokenExpirationDate(decoded: JwtPayload): Date | null {
    if (decoded.exp === undefined) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);

    return date;
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
    if (decoded === null) {
      return false;
    }
    return !this.isTokenExpired(decoded) && decoded.sub !== undefined;
  }
}
