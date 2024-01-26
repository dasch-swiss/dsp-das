import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { AuthService } from '@dasch-swiss/vre/shared/app-session';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  @Select(UserSelectors.user) user$: Observable<ReadUser>;

  constructor(
    private _authService: AuthService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  canActivate(): Observable<boolean> {
    return this._authService.isCredentialsValid$().pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          return true;
        } else {
          this._goToHomePage();
          return false;
        }
      })
    );
  }

  private _goToHomePage() {
    this.document.defaultView.location.href = `${RouteConstants.home}?returnLink=${this.document.defaultView.location.href}`;
  }
}
