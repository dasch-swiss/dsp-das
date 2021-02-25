import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import {
    AdministrativePermission,
    AdministrativePermissionsResponse,
    ApiResponseData,
    ApiResponseError,
    DefaultObjectAccessPermission,
    DefaultObjectAccessPermissionsResponse,
    KnoraApiConnection,
    Permission,
    ProjectPermission,
    ProjectPermissionsResponse,
    ProjectResponse,
    ReadGroup,
    ReadProject
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, Session, SessionService } from '@dasch-swiss/dsp-ui';
import { CacheService } from 'src/app/main/cache/cache.service';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';
import { AddGroupComponent } from './add-group/add-group.component';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

interface GroupPermission {
    groupName: string;
    apName: string;
    doapName: string[];
    additionalInfo: string;
}

@Component({
    selector: 'app-permission',
    templateUrl: './permission.component.html',
    styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit {

    // loading for progess indicator
    loading: boolean;

    // permissions of logged-in user
    session: Session;
    sysAdmin: boolean = false;
    projectAdmin: boolean = false;

    // project shortcode; as identifier in project cache service
    projectcode: string;

    // project data
    project: ReadProject;

    // project members
    projectGroups: ReadGroup[] = [];

    allPermissions: ProjectPermission[] = [];

    // administrative permissions
    adminPermission: AdministrativePermission[] = [];
    apHasPermission: Permission[] = [];

    // default object access permissions
    doaPermission: DefaultObjectAccessPermission[] = [];
    doapHasPermission: Permission[] = [];

    // tab header labels: user group and the permission labels
    columnLabels: any[] = [
        {
            name: 'Group',
            fullname: 'User group'
        },
        {
            name: 'RV',
            fullname: 'Restricted view'
        },
        {
            name: 'V',
            fullname: 'View'
        },
        {
            name: 'C',
            fullname: 'Create'
        },
        {
            name: 'M',
            fullname: 'Modify'
        },
        {
            name: 'D',
            fullname: 'Delete'
        }
    ];

    // list of user groups
    userGroups: any[] = [
        {
            name: 'SystemAdmin',
            fullname: 'System Admin'
        },
        {
            name: 'ProjectAdmin',
            fullname: 'Project Admin'
        },
        {
            name: 'ProjectMember',
            fullname: 'Project Member'
        },
        {
            name: 'KnownUser',
            fullname: 'Known User'
        },
        {
            name: 'UnknownUser',
            fullname: 'Unknown User'
        }
    ];

    permissionList: GroupPermission[] = [];

    perms: Permission[];


    @ViewChild('addGroupComponent') addGroup: AddGroupComponent;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _errorHandler: ErrorHandlerService,
        private _route: ActivatedRoute,
        private _session: SessionService,
        private _titleService: Title) {

        // get the shortcode of the current project
        this._route.parent.paramMap.subscribe((params: Params) => {
            this.projectcode = params.get('shortcode');
        });

        // set the page title
        this._titleService.setTitle('Project ' + this.projectcode + ' | Permissions');

    }

    ngOnInit() {

        // get information about the logged-in user
        this.session = this._session.getSession();

        // is the logged-in user system admin?
        this.sysAdmin = this.session.user.sysAdmin;

        // set the cache
        this._cache.get(this.projectcode, this._dspApiConnection.admin.projectsEndpoint.getProjectByShortcode(this.projectcode));

        // get the project data from cache
        this._cache.get(this.projectcode, this._dspApiConnection.admin.projectsEndpoint.getProjectByShortcode(this.projectcode)).subscribe(
            (response: ApiResponseData<ProjectResponse>) => {
                this.project = response.body.project;

                // is logged-in user projectAdmin?
                this.projectAdmin = this.sysAdmin ? this.sysAdmin : this.session.user.projectAdmin.some(e => e === this.project.id);

                const calls = [
                    this._dspApiConnection.admin.permissionsEndpoint.getAdministrativePermissions(this.project.id).pipe(
                        map((res: ApiResponseData<AdministrativePermissionsResponse>) => res.body)
                    ),
                    this._dspApiConnection.admin.permissionsEndpoint.getDefaultObjectAccessPermissions(this.project.id).pipe(
                        map((res: ApiResponseData<DefaultObjectAccessPermissionsResponse>) => res.body)
                    )
                ];

                forkJoin(calls).subscribe(
                    (res:  [AdministrativePermissionsResponse, DefaultObjectAccessPermissionsResponse]) =>
                    {
                        console.log(res);
                        this.perms = res[1].defaultObjectAccessPermissions[0].hasPermissions
                    }
                );

                this.loading = false;
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
                this.loading = false;
            }
        );

    }

}
