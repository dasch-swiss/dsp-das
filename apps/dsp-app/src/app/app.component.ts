import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    showCookieBanner = true;
    session = false;

    constructor(private _router: Router, private _titleService: Title) {
        // set the page title
        this._titleService.setTitle('DaSCH Service Platform');
    }

    ngOnInit() {
        if (localStorage.getItem('cookieBanner') === null) {
            localStorage.setItem(
                'cookieBanner',
                JSON.stringify(this.showCookieBanner)
            );
        } else {
            this.showCookieBanner = JSON.parse(
                localStorage.getItem('cookieBanner')
            );
        }
    }

    goToCookiePolicy() {
        this._router.navigate(['cookie-policy']);
    }

    closeCookieBanner() {
        this.showCookieBanner = !this.showCookieBanner;
        localStorage.setItem(
            'cookieBanner',
            JSON.stringify(this.showCookieBanner)
        );
    }
}
