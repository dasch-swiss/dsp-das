import { Inject, Injectable } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import { ProjectsStateModel } from './projects.state-model';
import { LoadAllProjectsAction, LoadProjectAction, LoadUserProjectsAction, ClearProjectsAction, RemoveUserFromProjectAction } from './projects.actions';
import { UserSelectors } from '../user/user.selectors';
import { AppConfigService, DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, ProjectResponse, ProjectsResponse, UserResponse } from '@dasch-swiss/dsp-js';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { map, take, tap } from 'rxjs/operators';
import { produce } from 'immer';
import { of } from 'rxjs';

let defaults: ProjectsStateModel = {
    isLoading: false,
    hasLoadingErrors: false,
    userOtherActiveProjects: [],
    allProjects: [],
    readProjects: [],
};

@State<ProjectsStateModel>({
    defaults,
    name: 'projects',
})
@Injectable()
export class ProjectsState {
    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private store: Store,
        private errorHandler: AppErrorHandler,
        private _acs: AppConfigService,
    ) {}

    @Action(LoadUserProjectsAction, { cancelUncompleted: true })
    loadUserProjects(
        ctx: StateContext<ProjectsStateModel>,
        { }: LoadUserProjectsAction
    ) {
        ctx.patchState({ isLoading: true });
        const userActiveProjects = this.store.selectSnapshot(UserSelectors.userActiveProjects);
        return this._dspApiConnection.admin.projectsEndpoint
                .getProjects()
                .pipe(
                    map((projectsResponse: ApiResponseData<ProjectsResponse> | ApiResponseError) => {
                            return projectsResponse as ApiResponseData<ProjectsResponse>;
                        }),
                )
                .subscribe(
                    (
                        projectsResponse: ApiResponseData<ProjectsResponse>
                    ) => {
                        // get list of all projects the user is NOT a member of
                        const otherProjects = projectsResponse.body.projects.filter(project => 
                            userActiveProjects.findIndex((userProj) => userProj.id === project.id) === -1);

                        ctx.setState({ ...ctx.getState(), isLoading: false, userOtherActiveProjects: otherProjects });
                    },
                    (error: ApiResponseError) => {
                        ctx.patchState({ hasLoadingErrors: true });
                        this.errorHandler.showMessage(error);
                    }
                );
    }

    @Action(LoadAllProjectsAction, { cancelUncompleted: true })
    loadAllProjectsAction(
        ctx: StateContext<ProjectsStateModel>,
        { }: LoadAllProjectsAction
    ) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.admin.projectsEndpoint
                .getProjects()
                .pipe(
                    map((projectsResponse: ApiResponseData<ProjectsResponse> | ApiResponseError) => {
                            return projectsResponse as ApiResponseData<ProjectsResponse>;
                        }),
                )
                .subscribe(
                    (response: ApiResponseData<ProjectsResponse>) => {
                        ctx.setState({ ...ctx.getState(), isLoading: false, allProjects: response.body.projects });
                    },
                    (error: ApiResponseError) => {
                        ctx.patchState({ hasLoadingErrors: true });
                        this.errorHandler.showMessage(error);
                    }
                );
    }

    @Action(LoadProjectAction, { cancelUncompleted: true })
    loadProjectAction(
        ctx: StateContext<ProjectsStateModel>,
        { projectUuid }: LoadProjectAction
    ) {
        // create the project iri
        const iri = `${this._acs.dspAppConfig.iriBase}/projects/${projectUuid}`;

        ctx.patchState({ isLoading: true });
    
        // get current project data, project members and project groups
        // and set the project state here
        return this._dspApiConnection.admin.projectsEndpoint
            .getProjectByIri(iri)
            .pipe(
                take(1),
                map((projectsResponse: ApiResponseData<ProjectResponse> | ApiResponseError) => {
                        return projectsResponse as ApiResponseData<ProjectResponse>;
                    }),
                tap({
                    next:(response: ApiResponseData<ProjectResponse>) => {
                        const project = response.body.project;
        
                        let state = ctx.getState();
                        if (!state.readProjects) {
                            state.readProjects = [];
                        }
                        
                        state = produce(state, draft => {
                            const index = draft.readProjects.findIndex(p => p.id === project.id);
                            index > -1 
                                ? draft.readProjects[index] = project
                                : draft.readProjects.push(project);
                            draft.isLoading = false;
                        });
                            
                        ctx.patchState(state);
                        return project;
                    },
                    error: (error: ApiResponseError) => {
                        ctx.patchState({ hasLoadingErrors: true });
                        this.errorHandler.showMessage(error);
                    }
                })
            );
    }
    
    @Action(ClearProjectsAction)
    clearProjects(ctx: StateContext<ProjectsStateModel>) {
        return of(ctx.getState()).pipe(
            map(currentState => {
                defaults.allProjects = currentState.allProjects as any;
                ctx.patchState(defaults);
                return currentState;
            })
        );
    }

    @Action(RemoveUserFromProjectAction)
    removeUserFromProject(
        ctx: StateContext<ProjectsStateModel>,
        { userId, projectId }: RemoveUserFromProjectAction
    ) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.admin.usersEndpoint
            .removeUserFromProjectMembership(userId, projectId)
            .pipe(
                take(1),
                map((response: ApiResponseData<UserResponse> | ApiResponseError) => {
                    return response as ApiResponseData<UserResponse>;
                }),
                tap({
                    next: (response: ApiResponseData<UserResponse>) => {
                        ctx.patchState({ isLoading: false });
                        return response.body.user;
                    },
                    error: (error) => {
                        this.errorHandler.showMessage(error);
                    }
                })
            )
    }
}
