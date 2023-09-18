import { ChangeDetectionStrategy, Component, Inject, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import {
    User,
} from '@dasch-swiss/dsp-js';
import { AuthService } from '@dasch-swiss/vre/shared/app-session';
import { MenuItem } from '@dsp-app/src/app/main/declarations/menu-item';
import { UserSelectors } from '@dsp-app/src/app/state/user/user.selectors';
import { Observable, Subject } from 'rxjs';
import { Select } from '@ngxs/store';
import { RouteConstants } from 'libs/vre/shared/app-config/src/lib/app-config/app-constants';

@Component({
    selector: 'app-user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent implements OnInit, OnDestroy {
    @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
    
    routeConstants = RouteConstants;
    navigation: MenuItem[];

    private ngUnsubscribe: Subject<void> = new Subject<void>();
    
    isLoggedIn$: Observable<boolean> = this._authService.isLoggedIn$;
    @Select(UserSelectors.user) user$: Observable<User>;

    constructor(
        private _authService: AuthService,
    ) {}

    ngOnInit() {
        this.navigation = [
            {
                label: 'DSP-App Home Page',
                shortLabel: 'home',
                route: this.routeConstants.homeRelative,
                icon: '',
            },
            {
                label: 'My Account',
                shortLabel: 'Account',
                route: this.routeConstants.userAccountRelative,
                icon: '',
            },
        ];
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * logout and destroy session
     *
     */
    logout() {
        this._authService.logout();
    }

    /**
     * closes menu in case of submitting login form
     */
    closeMenu() {
        this.menuTrigger.closeMenu();
    }
}
