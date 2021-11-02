import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DatadogRumService } from './main/services/datadog-rum.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    showCookieBanner = true;
    session = false;

    constructor(
        private _router: Router,
        private _titleService: Title,
        private _datadogRumService: DatadogRumService
    ) {

        // set the page title
        this._titleService.setTitle('DaSCH Service Platform');

        // init datadog RUM
        this._datadogRumService.initializeRum();
    }

    ngOnInit() {
        if (sessionStorage.getItem('cookieBanner') === null) {
            sessionStorage.setItem('cookieBanner', JSON.stringify(this.showCookieBanner));
        } else {
            this.showCookieBanner = JSON.parse(sessionStorage.getItem('cookieBanner'));
        }
    }

    goToCookiePolicy() {
        this._router.navigate(['cookie-policy']);
    }

    closeCookieBanner() {
        this.showCookieBanner = !this.showCookieBanner;
        sessionStorage.setItem('cookieBanner', JSON.stringify(this.showCookieBanner));
    }
}
