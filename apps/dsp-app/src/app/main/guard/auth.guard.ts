import { Inject, Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Actions, ofActionCompleted, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { AuthService } from '@dasch-swiss/vre/shared/app-session';
import { CurrentPageSelectors, SetUserAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  isLoggedIn$: Observable<boolean> = this._authService.isLoggedIn$;

  @Select(UserSelectors.user) user$: Observable<ReadUser>;

  constructor(
    private store: Store,
    private _authService: AuthService,
    private actions$: Actions,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  canActivate(): Observable<boolean> {
    return this.user$.pipe(
      switchMap((user) => {
        if (!user) {
          if (this.store.selectSnapshot(UserSelectors.isLoading)) {
            return this.actions$.pipe(
              ofActionCompleted(SetUserAction),
              concatMap(() => {
                return this.isLoggedIn$;
              })
            );
          } else {
            return this.store.dispatch(new SetUserAction(user)).pipe(
              concatMap(() => {
                return this.isLoggedIn$;
              })
            );
          }
        }
        return this.isLoggedIn$;
      }),
      map((isLoggedIn) => {
        if (isLoggedIn) {
          return true;
        }
        this.document.defaultView.location.href =
          `${this.document.defaultView.location.href}?` +
          `returnLink=${this.store.selectSnapshot(
            CurrentPageSelectors.loginReturnLink
          )}`;
        return false;
      })
    );
  }
}


