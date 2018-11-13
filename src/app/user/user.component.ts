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

    userName: string;

    // for the sidenav
    opened = true;

    navigation: MenuItem[] = [
        {
            label: 'Projects',
            route: '/projects',
            icon: 'assignment'
        },
        {
            label: 'Profile',
            route: '/profile',
            icon: 'fingerprint'
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
    }

    ngOnInit() {
        // set the cache here:
        // user's user-profile
        this.loading = true;
//        this._cache.get(this.userName, this._usersService.getUserByEmail(this.userName));
        this.loading = false;
    }

    toggleSidenav() {
        this.opened = !this.opened;
    }

}
