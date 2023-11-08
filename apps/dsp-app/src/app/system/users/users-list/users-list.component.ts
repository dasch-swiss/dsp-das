import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
    ApiResponseData,
    ApiResponseError,
    Constants,
    GroupsResponse,
    KnoraApiConnection,
    Permissions,
    ReadProject,
    ReadUser,
    UserResponse,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { DialogComponent } from '@dsp-app/src/app/main/dialog/dialog.component';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { SortingService } from '@dsp-app/src/app/main/services/sorting.service';
import { Select, Store } from '@ngxs/store';
import { CurrentProjectSelectors, LoadUserAction, RemoveUserFromProjectAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss'],
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

    // i18n plural mapping
    itemPluralMapping = {
        user: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '=1': '1 User',
            other: '# Users',
        },
        member: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '=1': '1 Member',
            other: '# Members',
        },
    };

    //
    // project view
    // dsp-js admin group iri
    adminGroupIri: string = Constants.ProjectAdminGroupIRI;

    // project uuid; as identifier in project application state service
    projectUuid: string;

    // proje0ct data
    project: ReadProject;

    //
    // sort properties
    sortProps: any = [
        {
            key: 'familyName',
            label: 'Last name',
        },
        {
            key: 'givenName',
            label: 'First name',
        },
        {
            key: 'email',
            label: 'E-mail',
        },
        {
            key: 'username',
            label: 'Username',
        },
    ];

    // ... and sort by 'username'
    sortBy = 'username';

    @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    @Select(UserSelectors.username) username$: Observable<string>;
    @Select(CurrentProjectSelectors.isProjectAdmin) isProjectAdmin$: Observable<boolean>;
    @Select(CurrentProjectSelectors.project) project$: Observable<ReadProject>;
    @Select(CurrentProjectSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;
    @Select(UserSelectors.isLoading) isUsersLoading$: Observable<boolean>;
    
    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _dialog: MatDialog,
        private _errorHandler: AppErrorHandler,
        private _route: ActivatedRoute,
        private _router: Router,
        private _sortingService: SortingService,
        private _store: Store,
    ) {
        // get the uuid of the current project
        this._route.parent.parent.paramMap.subscribe((params: Params) => {
            this.projectUuid = params.get('uuid');
        });
    }

    ngOnInit() {
        // sort list by defined key
        if (localStorage.getItem('sortUsersBy')) {
            this.sortBy = localStorage.getItem('sortUsersBy');
        } else {
            localStorage.setItem('sortUsersBy', this.sortBy);
        }
    }

    trackByFn = (index: number, item: ReadUser) => `${index}-${item.id}`;

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
        if (!this.project) {
            return false;
        }

        if (permissions) {
            // check if this user is project admin
            return (
                permissions.groupsPerProject[this.project.id].indexOf(
                    Constants.ProjectAdminGroupIRI
                ) > -1
            );
        } else {
            const userProjectGroups = this._store.selectSnapshot(UserSelectors.userProjectAdminGroups);
            // check if the logged-in user is project admin
            return userProjectGroups.some((e) => e === this.project.id);
        }
    }

    /**
     * returns true, when the user is system admin
     *
     * @param permissions PermissionData from user profile
     */
    userIsSystemAdmin(permissions: Permissions): boolean {
        let admin = false;
        const groupsPerProjectKeys: string[] = Object.keys(
            permissions.groupsPerProject
        );

        for (const key of groupsPerProjectKeys) {
            if (key === Constants.SystemProjectIRI) {
                admin =
                    permissions.groupsPerProject[key].indexOf(
                        Constants.SystemAdminGroupIRI
                    ) > -1;
            }
        }

        return admin;
    }

    /**
     * update user's group memebership
     */
    updateGroupsMembership(id: string, groups: string[]): void {
        const currentUserGroups: string[] = [];
        this._dspApiConnection.admin.usersEndpoint
            .getUserGroupMemberships(id)
            .subscribe(
                (response: ApiResponseData<GroupsResponse>) => {
                    for (const group of response.body.groups) {
                        currentUserGroups.push(group.id);
                    }

                    if (currentUserGroups.length === 0) {
                        // add user to group
                        // console.log('add user to group');
                        for (const newGroup of groups) {
                            this._dspApiConnection.admin.usersEndpoint
                                .addUserToGroupMembership(id, newGroup)
                                .subscribe(
                                    () => {},
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
                                this._dspApiConnection.admin.usersEndpoint
                                    .removeUserFromGroupMembership(id, oldGroup)
                                    .subscribe(
                                        () => {},
                                        (ngError: ApiResponseError) => {
                                            this._errorHandler.showMessage(
                                                ngError
                                            );
                                        }
                                    );
                            }
                        }
                        for (const newGroup of groups) {
                            if (currentUserGroups.indexOf(newGroup) > -1) {
                                // already member of this group
                            } else {
                                // console.log('add user to group');
                                this._dspApiConnection.admin.usersEndpoint
                                    .addUserToGroupMembership(id, newGroup)
                                    .subscribe(
                                        () => {},
                                        (ngError: ApiResponseError) => {
                                            this._errorHandler.showMessage(
                                                ngError
                                            );
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
        const currentUsername = this._store.selectSnapshot(UserSelectors.username);
        if (this.userIsProjectAdmin(permissions)) {
            // true = user is already project admin --> remove from admin rights

            this._dspApiConnection.admin.usersEndpoint
                .removeUserFromProjectAdminMembership(id, this.project.id)
                .subscribe(
                    (response: ApiResponseData<UserResponse>) => {
                        // if this user is not the logged-in user
                        if (currentUsername !== response.body.user.username) {
                            this.refreshParent.emit();
                        } else {
                            // the logged-in user removed himself as project admin
                            // the list is not available anymore;
                            // open dialog to confirm and
                            // redirect to project page
                            // update the application state of logged-in user and the session
                            this._store.dispatch(new LoadUserAction(currentUsername))
                                .pipe(take(1))
                                .subscribe((readUser: ReadUser) => {
                                    if (readUser.systemAdmin) {
                                        this.refreshParent.emit();
                                    } else {
                                        // logged-in user is NOT system admin:
                                        // go to project page and reload project admin interface
                                        this._router
                                            .navigateByUrl(RouteConstants.refreshRelative, {
                                                skipLocationChange: true,
                                            })
                                            .then(() =>
                                                this._router.navigate([ `${RouteConstants.projectRelative}/${this.projectUuid}`])
                                            );
                                    }
                                });
                        }
                    },
                    (error: ApiResponseError) => {
                        this._errorHandler.showMessage(error);
                    }
                );
        } else {
            // false: user isn't project admin yet --> add admin rights
            this._dspApiConnection.admin.usersEndpoint
                .addUserToProjectAdminMembership(id, this.project.id)
                .subscribe(
                    (response: ApiResponseData<UserResponse>) => {
                        if (currentUsername !== response.body.user.username) {
                            this.refreshParent.emit();
                        } else {
                            // the logged-in user (system admin) added himself as project admin
                            // update the application state of logged-in user and the session
                            this._store.dispatch(new LoadUserAction(currentUsername))
                                .pipe(take(1))
                                .subscribe((readUser: ReadUser) => {
                                    this.refreshParent.emit();
                                });
                        }
                    },
                    (error: ApiResponseError) => {
                        this._errorHandler.showMessage(error);
                    }
                );
        }
    }

    updateSystemAdminMembership(user: ReadUser, systemAdmin: boolean): void {
        this._dspApiConnection.admin.usersEndpoint
            .updateUserSystemAdminMembership(user.id, systemAdmin)
            .subscribe(
                () => {
                    if (this._store.selectSnapshot(UserSelectors.username) !== user.username) {
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
                top: '112px',
            },
            data: { name: name, mode: mode },
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((response) => {
            if (response === true) {
                switch (mode) {
                    case 'removeFromProject':
                        this._store.dispatch(new RemoveUserFromProjectAction(iri, this.project.id))
                            .pipe(take(1))
                            .subscribe(() => this.refreshParent.emit());
                        break;
                    case 'deleteUser':
                        this.deleteUser(iri);
                        break;
                    case 'activateUser':
                        this.activateUser(iri);
                        break;
                }
            }
        });
    }

    /**
     * delete resp. deactivate user
     *
     * @param id user's IRI
     */
    deleteUser(id: string) {
        this._dspApiConnection.admin.usersEndpoint.deleteUser(id).subscribe(
            () => {
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
        this._dspApiConnection.admin.usersEndpoint
            .updateUserStatus(id, true)
            .subscribe(
                () => {
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
            return !this._store.selectSnapshot(UserSelectors.isSysAdmin) 
                && !this._store.selectSnapshot(CurrentProjectSelectors.isProjectAdmin);
        }
    }

    sortList(key: any) {
        this.list = this._sortingService.keySortByAlphabetical(this.list, key);
        localStorage.setItem('sortUsersBy', key);
    }
}
