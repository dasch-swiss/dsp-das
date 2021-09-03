import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
    ApiResponseData,
    ApiResponseError,
    Constants,
    GroupsResponse,
    KnoraApiConnection,
    Permissions,
    ProjectResponse,
    ReadProject,
    ReadUser,
    UserResponse
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, Session, SessionService, SortingService } from '@dasch-swiss/dsp-ui';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';

@Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {

    // list of users: status active or inactive (deleted)
    @Input() status: boolean;

    // list of users: depending on the parent
    @Input() list: ReadUser[];

    // enable the button to create new user
    @Input() createNew = false;

    // in case of modification
    @Output() refreshParent: EventEmitter<any> = new EventEmitter<any>();

    // loading for progess indicator
    loading: boolean;

    // permissions of logged-in user
    session: Session;
    sysAdmin = false;
    projectAdmin = false;

    // i18n plural mapping
    itemPluralMapping = {
        user: {
            '=1': '1 User',
            other: '# Users'
        },
        member: {
            '=1': '1 Member',
            other: '# Members'
        }
    };

    //
    // project view
    // dsp-js admin group iri
    adminGroupIri: string = Constants.ProjectAdminGroupIRI;

    // project shortcode; as identifier in project cache service
    projectCode: string;

    // project data
    project: ReadProject;

    //
    // sort properties
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
        },
        {
            key: 'username',
            label: 'Username'
        }
    ];

    // ... and sort by 'username'
    sortBy = 'username';

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _dialog: MatDialog,
        private _errorHandler: ErrorHandlerService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _session: SessionService,
        private _sortingService: SortingService
    ) {
        // get the shortcode of the current project
        if (this._route.parent.paramMap) {
            this._route.parent.paramMap.subscribe((params: Params) => {
                this.projectCode = params.get('shortcode');
            });
        }
    }

    ngOnInit() {

        // get information about the logged-in user
        this.session = this._session.getSession();

        // is the logged-in user system admin?
        this.sysAdmin = this.session.user.sysAdmin;

        if (this.projectCode) {

            // get the project data from cache
            this._cache.get(this.projectCode).subscribe(
                (response: ReadProject) => {
                    this.project = response;
                    // is logged-in user projectAdmin?
                    this.projectAdmin = this.sysAdmin ? this.sysAdmin : this.session.user.projectAdmin.some(e => e === this.project.id);
                    this.loading = false;

                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
        }

        // sort list by defined key
        if (localStorage.getItem('sortUsersBy')) {
            this.sortBy = localStorage.getItem('sortUsersBy');
        } else {
            localStorage.setItem('sortUsersBy', this.sortBy);
        }
    }

    /**
     * returns true, when the user is project admin;
     * when the parameter permissions is not set,
     * it returns the value for the logged-in user
     *
     *
     * @param  [permissions] user's permissions
     * @returns boolean
     */
    userIsProjectAdmin(permissions?: Permissions): boolean {
        if (permissions) {
            // check if this user is project admin
            return (
                permissions.groupsPerProject[this.project.id].indexOf(
                    Constants.ProjectAdminGroupIRI
                ) > -1
            );
        } else {
            // check if the logged-in user is project admin
            return this.session.user.projectAdmin.some(e => e === this.project.id);
        }
    }

    /**
     * returns true, when the user is system admin
     *
     * @param permissions PermissionData from user profile
     */
    userIsSystemAdmin(permissions: Permissions): boolean {

        let admin = false;
        const groupsPerProjectKeys: string[] = Object.keys(permissions.groupsPerProject);

        for (const key of groupsPerProjectKeys) {
            if (key === Constants.SystemProjectIRI) {
                admin = permissions.groupsPerProject[key].indexOf(Constants.SystemAdminGroupIRI) > -1;
            }
        }

        return admin;
    }

    /**
     * update user's group memebership
     */
    updateGroupsMembership(id: string, groups: string[]): void {
        const currentUserGroups: string[] = [];
        this._dspApiConnection.admin.usersEndpoint.getUserGroupMemberships(id).subscribe(
            (response: ApiResponseData<GroupsResponse>) => {
                for (const group of response.body.groups) {
                    currentUserGroups.push(group.id);
                }

                if (currentUserGroups.length === 0) {
                    // add user to group
                    // console.log('add user to group');
                    for (const newGroup of groups) {
                        this._dspApiConnection.admin.usersEndpoint.addUserToGroupMembership(id, newGroup).subscribe(
                            (ngResponse: ApiResponseData<UserResponse>) => { },
                            (ngError: ApiResponseError) => {
                                this._errorHandler.showMessage(ngError);
                            }
                        );
                    }
                } else {
                    // which one is deselected?
                    // find id in groups --> if not exists: remove from group
                    for (const oldGroup of currentUserGroups) {
                        if (groups.indexOf(oldGroup) > -1) {
                            // already member of this group
                        } else {
                            // console.log('remove from group', oldGroup);
                            // the old group is not anymore one of the selected groups --> remove user from group
                            this._dspApiConnection.admin.usersEndpoint.removeUserFromGroupMembership(id, oldGroup).subscribe(
                                (ngResponse: ApiResponseData<UserResponse>) => { },
                                (ngError: ApiResponseError) => {
                                    this._errorHandler.showMessage(ngError);
                                }
                            );
                        }
                    }
                    for (const newGroup of groups) {
                        if (currentUserGroups.indexOf(newGroup) > -1) {
                            // already member of this group
                        } else {
                            // console.log('add user to group');
                            this._dspApiConnection.admin.usersEndpoint.addUserToGroupMembership(id, newGroup).subscribe(
                                (ngResponse: ApiResponseData<UserResponse>) => { },
                                (ngError: ApiResponseError) => {
                                    this._errorHandler.showMessage(ngError);
                                }
                            );
                        }
                    }
                }
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );
    }

    /**
     * update user's admin-group membership
     */
    updateProjectAdminMembership(id: string, permissions: Permissions): void {
        if (this.userIsProjectAdmin(permissions)) {
            // true = user is already project admin --> remove from admin rights

            this._dspApiConnection.admin.usersEndpoint.removeUserFromProjectAdminMembership(id, this.project.id).subscribe(
                (response: ApiResponseData<UserResponse>) => {

                    // if this user is not the logged-in user
                    if (this.session.user.name !== response.body.user.username) {
                        this.refreshParent.emit();
                    } else {
                        // the logged-in user removed himself as project admin
                        // the list is not available anymore;
                        // open dialog to confirm and
                        // redirect to project page
                        // update the cache of logged-in user and the session
                        this._session.setSession(this.session.user.jwt, this.session.user.name, 'username').subscribe();

                        if (this.sysAdmin) {
                            // logged-in user is system admin:
                            this.refreshParent.emit();
                        } else {
                            // logged-in user is NOT system admin:
                            // go to project page and reload project admin interface
                            this._router.navigateByUrl('/refresh', { skipLocationChange: true }).then(
                                () => this._router.navigate(['/project/' + this.projectCode])
                            );
                        }

                    }

                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
        } else {
            // false: user isn't project admin yet --> add admin rights
            this._dspApiConnection.admin.usersEndpoint.addUserToProjectAdminMembership(id, this.project.id).subscribe(
                (response: ApiResponseData<UserResponse>) => {
                    if (this.session.user.name !== response.body.user.username) {
                        this.refreshParent.emit();
                    } else {
                        // the logged-in user (system admin) added himself as project admin
                        // update the cache of logged-in user and the session
                        this._session.setSession(this.session.user.jwt, this.session.user.name, 'username').subscribe();
                        this.refreshParent.emit();
                    }
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
        }
    }

    updateSystemAdminMembership(user: ReadUser, systemAdmin: boolean): void {
        this._dspApiConnection.admin.usersEndpoint.updateUserSystemAdminMembership(user.id, systemAdmin).subscribe(
            (response: ApiResponseData<UserResponse>) => {
                if (this.session.user.name !== user.username) {
                    this.refreshParent.emit();
                }
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );
    }

    /**
     * open dialog in every case of modification:
     * edit user profile data, update user's password,
     * remove user from project or toggle project admin membership,
     * delete and reactivate user
     *
     */
    openDialog(mode: string, name?: string, iri?: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '560px',
            maxHeight: '80vh',
            position: {
                top: '112px'
            },
            data: { name: name, mode: mode }
        };

        const dialogRef = this._dialog.open(
            DialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe(response => {
            if (response === true) {
                // get the mode
                switch (mode) {
                    case 'removeFromProject':
                        this.removeUserFromProject(iri);
                        break;
                    case 'deleteUser':
                        this.deleteUser(iri);
                        break;
                    case 'activateUser':
                        this.activateUser(iri);
                        break;
                }
            } else {
                // update the view
                this.refreshParent.emit();
            }
        });
    }

    /**
     * remove user from project and update list of users
     *
     * @param id user's IRI
     * @returns void
     */
    removeUserFromProject(id: string): void {
        this._dspApiConnection.admin.usersEndpoint.removeUserFromProjectMembership(id, this.project.id).subscribe(
            (response: ApiResponseData<UserResponse>) => {
                this.refreshParent.emit();
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );
    }


    /**
     * delete resp. deactivate user
     *
     * @param id user's IRI
     */
    deleteUser(id: string) {
        this._dspApiConnection.admin.usersEndpoint.deleteUser(id).subscribe(
            (response: ApiResponseData<UserResponse>) => {
                this.refreshParent.emit();
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );
    }

    /**
     * reactivate user
     *
     * @param id user's IRI
     */
    activateUser(id: string) {
        this._dspApiConnection.admin.usersEndpoint.updateUserStatus(id, true).subscribe(
            (response: ApiResponseData<UserResponse>) => {
                this.refreshParent.emit();
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );
    }

    disableMenu(): boolean {

        // disable menu in case of:
        // project.status = false
        if (this.project && this.project.status === false) {
            return true;
        } else {
            return (!this.sysAdmin && !this.projectAdmin);
        }

    }

    sortList(key: any) {
        this.list = this._sortingService.keySortByAlphabetical(this.list, key);
        localStorage.setItem('sortUsersBy', key);
    }
}
