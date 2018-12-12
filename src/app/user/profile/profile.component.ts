import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User, UsersService } from '@knora/core';
import { CacheService } from '../../main/cache/cache.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    loading: boolean;
    error: boolean;

    @Input() username: string;

    user: User;

    constructor(private _cache: CacheService,
                private _route: ActivatedRoute,
                private _usersService: UsersService) {

        // get username from route and set the cache
        if (this._route.snapshot.params.name  && (this._route.snapshot.params.name.length > 3)) {
            this.username = this._route.snapshot.params.name;
            this._cache.get(this.username, this._usersService.getUser(this.username));
        }

    }

    ngOnInit() {
        this.loading = true;

        this._cache.get(this.username, this._usersService.getUser(this.username)).subscribe(
            (response: any) => {
                this.user = response;
                this.loading = false;
            },
            (error: any) => {
                console.error(error);
            }
        );
    }

}
