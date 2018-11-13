import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '@knora/core';
import { CacheService } from '../main/cache/cache.service';
import { MenuItem } from '../main/declarations/menu-item';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

    loading: boolean;

    username: string;

    route: string;

    // for the sidenav
    open: boolean = true;

    navigation: MenuItem[] = [
        {
            label: 'Profile',
            route: '/profile',
            icon: 'fingerprint'
        },
        {
            label: 'Projects',
            route: '/projects',
            icon: 'assignment'
        },
        {
            label: 'Account',
            route: '/account',
            icon: 'settings'
        }
    ];

    constructor(private _cache: CacheService,
                private _route: ActivatedRoute,
                private _usersService: UsersService) {

        // get the activated route; we need it for the viewer switch
        this.route = this._route.pathFromRoot[1].snapshot.url[0].path;
        // get username
        this.username = JSON.parse(localStorage.getItem('session')).user.name;
    }

    ngOnInit() {

        this.loading = true;
        // set the cache here:
        // user's user-profile
        this._cache.get(this.username, this._usersService.getUserByEmail(this.username));
        this.loading = false;
    }

    toggleSidenav() {
        this.open = !this.open;
    }

}
