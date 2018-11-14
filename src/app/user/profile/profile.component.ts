import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService } from '@knora/core';
import { CacheService } from '../../main/cache/cache.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    loading: boolean;

    @Input() username: string;

    user: User;

    constructor(private _cache: CacheService,
                private _usersService: UsersService) {
    }

    ngOnInit() {
        this.loading = true;

        this._cache.get(this.username, this._usersService.getUserByEmail(this.username)).subscribe(
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
