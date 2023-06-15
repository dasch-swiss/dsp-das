import { Component, Inject, Input, OnChanges, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import {
    ApiResponseData,
    ApiResponseError,
    KnoraApiConnection,
    ReadUser,
    UserResponse,
} from '@dasch-swiss/dsp-js';
import { CacheService } from '@dsp-app/src/app/main/cache/cache.service';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ErrorHandlerService } from '@dsp-app/src/app/main/services/error-handler.service';
import { AuthenticationService } from '@dsp-app/src/app/main/services/authentication.service';
import { SessionService } from '@dsp-app/src/app/main/services/session.service';
import { MenuItem } from '../../main/declarations/menu-item';

@Component({
    selector: 'app-user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent implements OnChanges {
    @Input() session: boolean;

    @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

    user: ReadUser;

    username: string;

    sysAdmin = false;

    navigation: MenuItem[];

    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _auth: AuthenticationService,
        private _cache: CacheService,
        private _errorHandler: ErrorHandlerService,
        private _session: SessionService
    ) {}

    ngOnChanges() {
        this.navigation = [
            {
                label: 'DSP-App Home Page',
                shortLabel: 'home',
                route: '/',
                icon: '',
            },
            {
                label: 'My Account',
                shortLabel: 'Account',
                route: '/account',
                icon: '',
            },
        ];

        if (this.session) {
            this.username = this._session.getSession().user.name;
            this.sysAdmin = this._session.getSession().user.sysAdmin;

            this._dspApiConnection.admin.usersEndpoint
                .getUserByUsername(this.username)
                .subscribe(
                    (response: ApiResponseData<UserResponse>) => {
                        this.user = response.body.user;
                        this._cache.set(this.username, this.user);
                    },
                    (error: ApiResponseError) => {
                        this._errorHandler.showMessage(error);
                    }
                );
        }
    }

    /**
     * logout and destroy session
     *
     */
    logout() {
        this._auth.logout();
    }

    /**
     * closes menu in case of submitting login form
     */
    closeMenu() {
        this.menuTrigger.closeMenu();
    }
}
