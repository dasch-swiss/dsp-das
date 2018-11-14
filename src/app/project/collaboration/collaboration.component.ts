import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project, ProjectsService, User } from '@knora/core';
import { CacheService } from '../../main/cache/cache.service';

@Component({
    selector: 'app-collaboration',
    templateUrl: './collaboration.component.html',
    styleUrls: ['./collaboration.component.scss']
})
export class CollaborationComponent implements OnInit {

    loading: boolean;

    projectcode: string;

    projectMembers: User[] = [];

    // list of active users
    active: User[] = [];
    // list of inactive (deleted) users
    inactive: User[] = [];


    constructor(private _cache: CacheService,
                private _projectsService: ProjectsService,
                private _route: ActivatedRoute) {

        // get the shortcode of the current project
        this.projectcode = this._route.parent.snapshot.params.shortcode;
    }

    ngOnInit() {
        this.initList();
    }

    initList(): void {
        this._cache.get('members_of_' + this.projectcode, this._projectsService.getProjectMembersByShortcode(this.projectcode)).subscribe(
            (response: any) => {
                this.projectMembers = response;

                // clean up list of users
                this.active = [];
                this.inactive = [];

                for (const u of this.projectMembers) {

                    if (u.status === true) {
                        this.active.push(u);
                    } else {
                        this.inactive.push(u);
                    }

                }

                this.loading = false;
            },
            (error: any) => {
                console.error(error);
            }
        );
    }

}
