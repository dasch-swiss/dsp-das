import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AppGlobal } from '../app-global';
import { MenuItem } from '../main/declarations/menu-item';
import { SessionService } from '@dasch-swiss/vre/shared/app-session';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
})
export class UserComponent {
    loading: boolean;
    error: boolean;

    session = this.sessionService.session;

    route: string;

    // for the sidenav
    open = true;

    navigation: MenuItem[] = AppGlobal.userNav;

    constructor(
        private sessionService: SessionService,
        private _route: ActivatedRoute,
        private _titleService: Title
    ) {
        // get the activated route; we need it for the viewer switch
        this.route = this._route.pathFromRoot[1].snapshot.url[0].path;

        // get session
        // set the page title
        this._titleService.setTitle(this.session().user.name);
    }
}
