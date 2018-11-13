import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project, ProjectsService, User } from '@knora/core';
import { CacheService } from '../../main/cache/cache.service';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

    loading: boolean;

    projectcode: string;

    project: Project;
    projectMembers: User[] = [];

    constructor(private _cache: CacheService,
                private _route: ActivatedRoute,
                private _projectsService: ProjectsService) {

        // get the shortcode of the current project
        this.projectcode = this._route.parent.snapshot.params.shortcode;

    }

    ngOnInit() {
        this.loading = true;
        this._cache.get(this.projectcode, this._projectsService.getProjectByShortcode(this.projectcode)).subscribe(
            (response: any) => {
                this.project = response;
                this.loading = false;
            },
            (error: any) => {
                console.error(error);
            }
        );
        this.loading = false;

    }

}
