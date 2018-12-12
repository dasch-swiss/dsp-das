import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiServiceError, Project, ProjectsService } from '@knora/core';
import { CacheService } from '../main/cache/cache.service';
import { MenuItem } from '../main/declarations/menu-item';

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

    loading: boolean;
    error: boolean;

    projectcode: string;

    project: Project;

    // for the sidenav
    open: boolean = true;

    navigation: MenuItem[] = [
        {
            label: 'Project',
            route: 'board',
            icon: 'assignment'
        },
        {
            label: 'Collaboration',
            route: 'collaboration',
            icon: 'group'
        },
        {
            label: 'Ontologies',
            route: 'ontologies',
            icon: 'timeline',
            children: [
                {
                    label: 'gaga',
                    route: 'gaga',
                    icon: 'dash',
                }
            ]
        }
    ];


    constructor(private _cache: CacheService,
                private _route: ActivatedRoute,
                private _projectsService: ProjectsService) {

        // get the shortcode of the current project
        this.projectcode = this._route.snapshot.params.shortcode;

        this.error = this.validateShortcode(this.projectcode);

    }

    ngOnInit() {

        if (!this.error) {

            this.loading = true;
            // set the cache here:
            // current project data
            this._cache.get(this.projectcode, this._projectsService.getProjectByShortcode(this.projectcode));
            this._cache.get('members_of_' + this.projectcode, this._projectsService.getProjectMembersByShortcode(this.projectcode));

            this._cache.get(this.projectcode, this._projectsService.getProjectByShortcode(this.projectcode)).subscribe(
                (result: any) => {
                    this.project = result;
                    this.navigation[0].label = result.shortname.toUpperCase();
                    this.loading = false;
                },
                (error: ApiServiceError) => {
                    console.error(error);
                    this.error = true;
                    this.loading = false;
                }
            );
        } else {
            // shortcode isn't valid
            // TODO: show an error page
        }
    }

    validateShortcode(code: string) {
        const regexp: any = /^[0-9A-Fa-f]+$/;

        return !(regexp.test(code) && code.length === 4);
    }

}
