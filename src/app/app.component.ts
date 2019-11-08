import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SessionService } from '@knora/authentication';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    session: boolean = false;

    constructor(
        private _titleService: Title,
        private _session: SessionService) {

        // set the page title
        this._titleService.setTitle('Knora App | DaSCH\'s generic user interface');

        this.session = this._session.validateSession();
    }

    ngOnInit() {

    }
}