import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AppGlobal } from '../app-global';
import { MenuItem } from '../main/declarations/menu-item';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { take, tap } from 'rxjs/operators';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {

    route: string;

    navigation: MenuItem[] = AppGlobal.userNav;

    @Select(UserSelectors.username) username$: Observable<string>;

    routeConstants = RouteConstants;

    constructor(
        private _route: ActivatedRoute,
        private _titleService: Title,
    ) {
        // get the activated route; we need it for the viewer switch
        this.route = this._route.pathFromRoot[1].snapshot.url[0].path;

        this.username$.pipe(
            take(1),
            tap((username: string) => {
                this._titleService.setTitle(username)
            }
        )).subscribe();
    }

}
