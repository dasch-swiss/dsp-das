import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService } from '@knora/core';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private _session: SessionService,
        private _router: Router) {

    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        // this._session.validateSession().subscribe(
        //     (response: boolean) => {
        //         console.log('auth guard respons of validation:', response);
        //         if (!response) {
        //             this._router.navigate(['login'], { queryParams: { returnUrl: state.url } });
        //             return false;
        //         }
        //     }
        // );
        // return true;

        if (!this._session.validateSession()) {
            this._router.navigate(['login'], { queryParams: { returnUrl: state.url } });
            return false;
        }

        return true;
    }

}
