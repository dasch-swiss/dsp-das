import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceError, Project, ProjectsService, User } from '@knora/core';
import { CacheService } from '../../../main/cache/cache.service';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

    loading: boolean;

    @Input() list: User[];
    @Input() disabled?: boolean;

    projectcode: string;

    project: Project;
    itemPluralMapping = {
        'member': {
            // '=0': '0 Members',
            '=1': '1 Member',
            'other': '# Members'
        }
    };

    sortProps: any = [
        {
            key: 'familyName',
            label: 'Last name'
        },
        {
            key: 'givenName',
            label: 'First name'
        },
        {
            key: 'email',
            label: 'E-mail'
        }
    ];

    constructor(private _cache: CacheService,
                private _projectsService: ProjectsService,
                private _route: ActivatedRoute,
                private _router: Router) {

        // get the shortcode of the current project
        this.projectcode = this._route.parent.snapshot.params.shortcode;

    }

    ngOnInit() {
        this.loading = true;

        // get project data from cache
        this._cache.get(this.projectcode, this._projectsService.getProjectByShortcode(this.projectcode)).subscribe(
            (response: any) => {
                this.project = response;
            },
            (error: ApiServiceError) => {
                console.error(error);
            }
        );

        this.loading = false;
    }

    edit(user: string) {
        const userEncoded: string = encodeURIComponent(user);
        this._router.navigate(['/user/' + userEncoded + '/edit']).catch(
            result => console.log(result)
        );
        // [routerLink]="'/user/' + encodeURIComponent(item.email) + '/edit'"
        // activate form inside of expansion panel
        // console.log('open dialog box for', user.id);
    }

}
