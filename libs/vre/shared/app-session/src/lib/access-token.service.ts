import { EventEmitter, Injectable, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponseData, ApiResponseError, CredentialsResponse, LoginResponse, User } from '@dasch-swiss/dsp-js';
import { Auth, DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import {
  ClearListsAction,
  ClearOntologiesAction,
  ClearOntologyClassAction,
  ClearProjectsAction,
  LogUserOutAction,
  UserSelectors,
} from '@dasch-swiss/vre/shared/app-state';
import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, take, takeLast, tap } from 'rxjs/operators';
import { LoginError, ServerError } from './error';

@Injectable({ providedIn: 'root' })
export class AccessTokenService {
  getAccessToken() {
    return localStorage.getItem(Auth.AccessToken);
  }

  storeToken(token: string) {
    localStorage.setItem(Auth.AccessToken, token);
    this.startTokenRefresh();
  }

  removeTokens() {
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

  private getTokenExpirationDate(token: string): Date | null {
    const decoded = jwt_decode<JwtPayload>(token);

    if (decoded.exp === undefined) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);

    return date;
  }

  private getTokenExp(token: string): number {
    const decoded = jwt_decode<JwtPayload>(token);

    if (decoded.exp === undefined) {
      return 0;
    }

    return decoded.exp;
  }

  private startTokenRefresh() {
    const token = this.getAccessToken();

    if (!token) {
      return;
    }

    const exp = this.getTokenExp(token);
    const date = new Date(0);
    date.setUTCSeconds(exp);
  }

  getTokenUser(): string {
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
