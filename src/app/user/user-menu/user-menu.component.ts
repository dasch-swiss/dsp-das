import { Component, Inject, Input, OnChanges, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import {
    ApiResponseData,
    ApiResponseError,
    KnoraApiConnection,
    LogoutResponse,
    ReadUser,
    UserResponse
} from '@dasch-swiss/dsp-js';
import { AppGlobal } from 'src/app/app-global';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';
import { DatadogRumService } from 'src/app/main/services/datadog-rum.service';
import { SessionService } from 'src/app/main/services/session.service';
import { MenuItem } from '../../main/declarations/menu-item';

@Component({
    selector: 'app-user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnChanges {


    @Input() session: boolean;

    @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

    user: ReadUser;

    username: string;

    sysAdmin = false;

    navigation: MenuItem[];

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _datadogRumService: DatadogRumService,
        private _errorHandler: ErrorHandlerService,
        private _session: SessionService
    ) { }

    ngOnChanges() {

        this.navigation = AppGlobal.userNav;

        if (this.session) {
            this.username = this._session.getSession().user.name;
            this.sysAdmin = this._session.getSession().user.sysAdmin;

            this._cache.get(this.username, this._dspApiConnection.admin.usersEndpoint.getUserByUsername(this.username));
            this._cache.get(this.username, this._dspApiConnection.admin.usersEndpoint.getUserByUsername(this.username)).subscribe(
                (response: ApiResponseData<UserResponse>) => {
                    this.user = response.body.user;
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
        }

    }

    /**
     *
     * logout and destroy session
     *
     */
    logout() {
        // this.loading = true;

        this._session.logout();

        // this._dspApiConnection.v2.auth.logout().subscribe(
        //     (response: ApiResponseData<LogoutResponse>) => {
        //         this._session.destroySession();
        //         this._datadogRumService.removeActiveUser();


        //         this.buildLoginForm();
        //         this.session = undefined;
        //         this.form.get('password').setValue('');
        //         this.logoutSuccess.emit(true);
        //     },
        //     (error: ApiResponseError) => {
        //         this._notification.openSnackBar(error);
        //         this.loading = false;
        //         this.logoutSuccess.emit(false);
        //     }
        // );

    }

    // login() {
    //     this._session.login();
    // }

    // logout() {
    //     this._session.logout();
    // }

    closeMenu() {
        this.menuTrigger.closeMenu();
    }
}
