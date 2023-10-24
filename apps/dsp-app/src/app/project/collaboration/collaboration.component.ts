import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import {
    ApiResponseData,
    ApiResponseError,
    MembersResponse,
    ReadProject,
    ReadUser,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import { AddUserComponent } from './add-user/add-user.component';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { CurrentProjectSelectors, LoadProjectMembersAction, ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-collaboration',
    templateUrl: './collaboration.component.html',
    styleUrls: ['./collaboration.component.scss'],
})
export class CollaborationComponent implements OnInit {
    @ViewChild('addUserComponent') addUser: AddUserComponent;

    // loading for progess indicator
    loading: boolean;

    isProjectAdmin = false;

    // project uuid; as identifier in project application state service
    projectUuid: string;

    // project data
    project: ReadProject;

    // project members
    projectMembers: ReadUser[] = [];

    // two lists of project members:
    // list of active users
    active: ReadUser[] = [];
    // list of inactive (deleted) users
    inactive: ReadUser[] = [];

    @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    @Select(CurrentProjectSelectors.project) project$: Observable<ReadProject>;
    
    constructor(
        private _errorHandler: AppErrorHandler,
        private _route: ActivatedRoute,
        private _projectService: ProjectService,
        private _titleService: Title,
        private _store: Store,
        private _actions$: Actions,
    ) {
        // get the uuid of the current project
        if (this._route.parent.parent.snapshot.url.length) {
            this._route.parent.parent.paramMap.subscribe((params: Params) => {
                this.projectUuid = params.get('uuid');
            });
        }
    }

    ngOnInit() {
        this.loading = true;

        const userProjectGroups = this._store.selectSnapshot(UserSelectors.userProjectAdminGroups);
        const user = this._store.selectSnapshot(UserSelectors.user) as ReadUser;
        this.project$
            .pipe(take(1))
            .subscribe((project: ReadProject) => {
                this.project = project;

                // set the page title
                this._titleService.setTitle(
                    'Project ' + this.project.shortname + ' | Collaboration'
                );
                
                // is logged-in user projectAdmin?
                this.isProjectAdmin = this._projectService.isProjectAdminOrSysAdmin(user, userProjectGroups, this.project.id);

                // get list of project members and groups
                if (this.isProjectAdmin) {
                    this.refresh();
                }

                this.loading = false;
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
                this.loading = false;
            }
        )

    }

    /**
     * build the list of members
     */
    initList(): void {
        const projectIri = this._projectService.uuidToIri(this.projectUuid);
        this._store.dispatch(new LoadProjectMembersAction(projectIri));
        this._actions$.pipe(ofActionSuccessful(LoadProjectMembersAction))
            .pipe(take(1))
            .subscribe(() => {
                this.projectMembers = this._store.selectSnapshot(ProjectsSelectors.projectMembers)[this.projectUuid].value;

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
            });
    }

    /**
     * refresh list of members after adding a new user to the team
     */
    refresh(): void {
        // refresh the component
        this.loading = true;

        this.initList();

        // refresh child component: add user
        if (this.addUser) {
            this.addUser.buildForm();
        }
    }
}
