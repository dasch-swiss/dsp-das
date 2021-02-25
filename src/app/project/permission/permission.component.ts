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

                this.getProjectPermissions(this.project.id);
                this.getAdministrativePermissions(this.project.id);
                this.getDefaultObjectAccessPermissions(this.project.id);

                this.loading = false;
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
                this.loading = false;
            }
        );

    }

    getProjectPermissions(projectIri: string) {
        this._dspApiConnection.admin.permissionsEndpoint.getProjectPermissions(projectIri).subscribe(
            (response: ApiResponseData<ProjectPermissionsResponse>)=> {
                this.allPermissions = response.body.permissions;
                console.log('getProjectPermissions response', this.allPermissions);
        });
    }

    getAdministrativePermissions(projectIri: string) {
        this._dspApiConnection.admin.permissionsEndpoint.getAdministrativePermissions(projectIri).subscribe(
            (response: ApiResponseData<AdministrativePermissionsResponse>)=> {
                if (response) {
                    this.adminPermission = response.body.administrative_permissions;
                    console.log('getAdministrativePermissions response', this.adminPermission);

                    for (const ap of this.adminPermission) {
                        if (ap.forGroup) {
                            // this.apHasPermission = ap.hasPermissions;
                            // console.log('ap.hasPermissions', ap.hasPermissions);

                            for (const permission of ap.hasPermissions) {
                                if (permission.name === "ProjectResourceCreateAllPermission") {
                                    const apGroup: GroupPermission = {
                                        'groupName': ap.forGroup,
                                        'apName': permission.name,
                                        'doapName': undefined,
                                        'additionalInfo': permission.additionalInformation
                                    };
                                    // console.log(ap.forGroup + ' admin hasPermissions: ', this.apHasPermission);
                                    this.permissionList.push(apGroup);
                                    // console.log('permissionList in AP: ', this.permissionList);
                                }
                            }
                        }
                    }
                }
        });
    }

    getDefaultObjectAccessPermissions(projectIri: string) {
        this._dspApiConnection.admin.permissionsEndpoint.getDefaultObjectAccessPermissions(projectIri).subscribe(
            (response: ApiResponseData<DefaultObjectAccessPermissionsResponse>)=> {
                if (response) {
                    this.doaPermission = response.body.defaultObjectAccessPermissions;
                    console.log('getDefaultObjectAccessPermissions response', this.doaPermission);

                        for (const doap of this.doaPermission) {
                            for (const item of this.permissionList) {

                                if (doap.forGroup === item.groupName) {

                                    // console.log(doap.forGroup + ' doap permissions: ' + doap.hasPermissions);
                                    // console.log('permissionList in DOAP: ', this.permissionList);

                                    /* for (const permission of doap.hasPermissions) {

                                        if (permission.name !== "CR") {

                                            const doapGroup: GroupPermission = {
                                                'groupName': doap.forGroup,
                                                'permissionName': permission.name,
                                                'additionalInfo': permission.additionalInformation
                                            };

                                            this.permissionList.push(doapGroup);
                                            // console.log('permissionList in AP: ', this.permissionList);
                                        }
                                    } */
                                }
                            }
                        }
                }
        });
    }

}
