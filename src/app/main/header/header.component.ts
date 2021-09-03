import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationStart, Router } from '@angular/router';
import { SearchParams } from '@dasch-swiss/dsp-ui';
import { Subscription } from 'rxjs';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ComponentCommunicationEventService, Events } from 'src/app/main/services/component-communication-event.service';
import { NotificationService } from '../services/notification.service';
import { SessionService } from '../services/session.service';

const { version: appVersion } = require('../../../../package.json');

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

    session = false;
    show = false;
    searchParams: SearchParams;

    appVersion: string = 'v' + appVersion;

    componentCommsSubscription: Subscription;

    constructor(
        private _componentCommsService: ComponentCommunicationEventService,
        private _dialog: MatDialog,
        private _domSanitizer: DomSanitizer,
        private _matIconRegistry: MatIconRegistry,
        private _notification: NotificationService,
        private _router: Router,
        private _session: SessionService
    ) {

        // create tool icons to use them in mat-icons
        this._matIconRegistry.addSvgIcon(
            'dasch_icon_black',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/dasch-icon-black.svg')
        );

        // logged-in user? show user menu or login button

        this._router.events.forEach((event) => {
            // console.log('EVENT', event);
            if (event instanceof NavigationStart) {
                this._session.isSessionValid().subscribe((response) => {
                    this.session = response;
                });
            }
        });
    }

    ngOnInit() {
        this.componentCommsSubscription = this._componentCommsService.on(
            Events.loginSuccess, () => {
                this._notification.openSnackBar('Login successful');
            });
    }

    ngOnDestroy() {
        // unsubscribe from the ValueOperationEventService when component is destroyed
        if (this.componentCommsSubscription !== undefined) {
            this.componentCommsSubscription.unsubscribe();
        }
    }

    /**
     * navigate to the login page
     */
    goToLogin() {
        // console.log(decodeURI(this._router.url));
        this._router.navigate(['login'], {
            queryParams: {
                returnUrl: decodeURI(this._router.url)
            }
        });
    }

    /**
     * show or hide search bar in phone version
     */
    showSearchBar() {
        this.show = !this.show;
    }

    doSearch(search: SearchParams) {

        // reset search params
        this.searchParams = undefined;

        // we can do the routing here or send the search param
        // to (resource) list view directly
        this.searchParams = search;

        if (this.searchParams.mode && this.searchParams.query) {

            let doSearchRoute = '/search/' + this.searchParams.mode + '/' + encodeURIComponent(this.searchParams.query);

            if (this.searchParams.filter && this.searchParams.filter.limitToProject) {
                doSearchRoute += '/' + encodeURIComponent(this.searchParams.filter.limitToProject);
            }

            this._router.navigate([doSearchRoute]);
        }

    }

    openDialog(mode: string, name?: string, iri?: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '840px',
            maxHeight: '80vh',
            position: {
                top: '112px'
            },
            data: { mode: mode, title: name, id: iri }
        };

        const dialogRef = this._dialog.open(
            DialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe(() => {

            // do something

        });
    }

    openNewResourceForm(mode: string, name?: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '840px',
            maxHeight: '80vh',
            position: {
                top: '112px'
            },
            data: { mode: mode, title: 'New resource',  subtitle: 'Create new resource' },
            disableClose: true
        };

        const dialogRef = this._dialog.open(
            DialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe(() => {

            // do something

        });
    }

}


