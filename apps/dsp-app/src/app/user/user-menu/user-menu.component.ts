import { Component, Inject, Input, OnChanges, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import {
    ApiResponseData,
    ApiResponseError,
    KnoraApiConnection,
    ReadProject,
    ReadUser,
    UserResponse,
} from '@dasch-swiss/dsp-js';
import { ApplicationStateService } from '@dasch-swiss/vre/shared/app-state-service';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { SessionService } from '@dasch-swiss/vre/shared/app-session';
import { MenuItem } from '../../main/declarations/menu-item';

@Component({
    selector: 'app-user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent implements OnChanges {
    session = this.sessionService.session;

    @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

    user: ReadUser;

    username: string;

    sysAdmin = false;

    navigation: MenuItem[];

    constructor(
        private _applicationStateService: ApplicationStateService,
        private sessionService: SessionService
    ) {}

    ngOnChanges() {
        console.log('user menu component ngOnChanges');
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

        if (this.session()) {
            this.username = this.session().user.name;
            this.sysAdmin = this.session().user.sysAdmin;

            this._applicationStateService
                .get(this.session().user.name)
                .subscribe((response: ReadUser) => {
                    this.user = response;
                });
        }
    }

    /**
     * logout and destroy session
     *
     */
    logout() {
        this.sessionService.logout();
    }

    /**
     * closes menu in case of submitting login form
     */
    closeMenu() {
        this.menuTrigger.closeMenu();
    }
}
