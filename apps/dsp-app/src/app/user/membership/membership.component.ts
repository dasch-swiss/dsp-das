import {
    Component,
    EventEmitter,
    Inject,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import {
    ApiResponseData,
    ApiResponseError,
    Constants,
    KnoraApiConnection,
    ProjectsResponse,
    ReadUser,
    UserResponse,
} from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import { AutocompleteItem } from '../../workspace/search/operator';
import { Select, Store } from '@ngxs/store';
import { RemoveUserFromProjectAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

// --> TODO replace it by IPermissions from dsp-js
export interface IPermissions {
    groupsPerProject: any;
    administrativePermissionsPerProject: any;
}

@Component({
    selector: 'app-membership',
    templateUrl: './membership.component.html',
    styleUrls: ['./membership.component.scss'],
})
export class MembershipComponent implements OnInit {
    @Input() username: string;

    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    loading: boolean;

    user: ReadUser;

    projects: AutocompleteItem[] = [];
    newProject = new UntypedFormControl();

    // i18n plural mapping
    itemPluralMapping = {
        project: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '=1': '1 project',
            other: '# projects',
        },
    };
    
    @Select(UserSelectors.user) user$: Observable<ReadUser>;

    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: AppErrorHandler,
        private _projectService: ProjectService,
        private _store: Store
    ) {}

    ngOnInit() {
        this.user = this._store.selectSnapshot(UserSelectors.user) as ReadUser;
        this.initNewProjects();
    }

    initNewProjects() {
        this.projects = [];
        // get all projects and filter by projects where the user is already member of
        this._dspApiConnection.admin.projectsEndpoint.getProjects().subscribe(
            (response: ApiResponseData<ProjectsResponse>) => {
                for (const p of response.body.projects) {
                    if (
                        p.id !== Constants.SystemProjectIRI &&
                        p.id !== Constants.DefaultSharedOntologyIRI &&
                        p.status === true
                    ) {
                        // get index example:
                        // myArray.findIndex(i => i.hello === "stevie");
                        if (
                            this.user.projects.findIndex(
                                (i) => i.id === p.id
                            ) === -1
                        ) {
                            this.projects.push({
                                iri: p.id,
                                name: p.longname + ' (' + p.shortname + ')',
                            });
                        }
                        /*
                        if (this.user.projects.indexOf(p.id) > -1) {
                            console.log('member of', p);
                        } */
                    }
                }

                this.projects.sort(function (
                    u1: AutocompleteItem,
                    u2: AutocompleteItem
                ) {
                    if (u1.name < u2.name) {
                        return -1;
                    } else if (u1.name > u2.name) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                this.newProject.setValue('');

                this.loading = false;
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );
    }

    /**
     * remove user from project
     *
     * @param iri Project iri
     */
    removeFromProject(iri: string) {
        this.loading = true;
        this._store.dispatch(new RemoveUserFromProjectAction(this.user.id, iri))
            .pipe(take(1))
            .subscribe((response: ApiResponseData<UserResponse>) => {
                    this.user = response.body.user;
                    this.initNewProjects();
                    // this.updateProjectCache(iri);
                    this.loading = false;
            });
    }

    addToProject(iri: string) {
        this.loading = true;
        this._store.dispatch(new RemoveUserFromProjectAction(this.user.id, iri))
            .pipe(take(1))
            .subscribe(
                (response: ApiResponseData<UserResponse>) => {
                    this.user = response.body.user;
                    this.initNewProjects();
                    // this.updateProjectCache(iri);
                    this.loading = false;
            });
    }

    /**
     * returns true, when the user is project admin;
     * when the parameter permissions is not set,
     * it returns the value for the logged-in user
     *
     *
     * @param  [permissions] user's permissions
     * @param  [iri] project id
     * @returns boolean
     */
    userIsProjectAdmin(permissions: PermissionsData, iri: string): boolean {
        return (
            permissions.groupsPerProject[iri].indexOf(
                Constants.ProjectAdminGroupIRI
            ) > -1
        );
    }
}
