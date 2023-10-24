import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import { Inject, Injectable } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import { ProjectsStateModel } from './projects.state-model';
import { LoadAllProjectsAction, LoadProjectAction, LoadUserProjectsAction, ClearProjectsAction, RemoveUserFromProjectAction, AddUserToProjectMembershipAction, LoadProjectMembersAction, LoadProjectGroupsAction, UpdateProjectAction } from './projects.actions';
import { UserSelectors } from '../user/user.selectors';
import { AppConfigService, DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ApiResponseData, ApiResponseError, GroupsResponse, KnoraApiConnection, MembersResponse, ProjectResponse, ProjectsResponse, ReadUser, UserResponse } from '@dasch-swiss/dsp-js';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { map, take, tap } from 'rxjs/operators';
import { produce } from 'immer';
import { of } from 'rxjs';
import { CurrentProjectSelectors } from '../current-project/current-project.selectors';
import { SetCurrentProjectAction, SetCurrentProjectGroupsAction, SetCurrentProjectMembersAction } from '../current-project/current-project.actions';

let defaults: ProjectsStateModel = {
    isLoading: false,
    hasLoadingErrors: false,
    userOtherActiveProjects: [],
    allProjects: [],
    readProjects: [],
    projectMembers: {},
    projectGroups: {},
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
        private projectService: ProjectService
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
        ctx.patchState({ isLoading: true });
    
        // get current project data, project members and project groups
        // and set the project state here
        return this._dspApiConnection.admin.projectsEndpoint
            .getProjectByIri(this.projectService.uuidToIri(projectUuid))
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

    @Action(AddUserToProjectMembershipAction)
    addUserToProjectMembership(
        ctx: StateContext<ProjectsStateModel>,
        { userId, projectIri }: AddUserToProjectMembershipAction
    ) {
        ctx.patchState({ isLoading: true, hasLoadingErrors: false });
        return this._dspApiConnection.admin.usersEndpoint
            .addUserToProjectMembership(userId, projectIri)
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
                        ctx.patchState({ hasLoadingErrors: true });
                        this.errorHandler.showMessage(error);
                    }
                })
            )
    }
    
    @Action(LoadProjectMembersAction)
    loadProjectMembersAction(
        ctx: StateContext<ProjectsStateModel>,
        { projectUuid }: LoadProjectMembersAction
    ) {
        ctx.patchState({ isLoading: true, hasLoadingErrors: false });
        return this._dspApiConnection.admin.projectsEndpoint.getProjectMembersByIri(projectUuid)
            .pipe(
                take(1),
                map((membersResponse: ApiResponseData<MembersResponse> | ApiResponseError) => {
                    return membersResponse as ApiResponseData<MembersResponse>;
                }),
                tap({
                    next: (response: ApiResponseData<MembersResponse>) => {
                        ctx.setState({ 
                            ...ctx.getState(), 
                            isLoading: false,
                            projectMembers: { [projectUuid] : { value: response.body.members } }
                        });
                        const currentProject = this.store.selectSnapshot(CurrentProjectSelectors.project);
                        if (currentProject?.id === projectUuid) {
                            ctx.dispatch(new SetCurrentProjectMembersAction(response.body.members));
                        }
                    },
                    error: (error) => {
                        ctx.patchState({ hasLoadingErrors: true });
                        this.errorHandler.showMessage(error);
                    }
                })
            );
    }

    @Action(LoadProjectGroupsAction)
    loadProjectGroupsAction(
        ctx: StateContext<ProjectsStateModel>,
        { projectUuid }: LoadProjectGroupsAction
    ) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.admin.groupsEndpoint.getGroups()
            .pipe(
                take(1),
                map((groupsResponse: ApiResponseData<GroupsResponse> | ApiResponseError) => {
                    return groupsResponse as ApiResponseData<GroupsResponse>;
                }),
                tap({
                    next: (response: ApiResponseData<GroupsResponse>) => {
                        ctx.setState({ 
                            ...ctx.getState(), 
                            isLoading: false, 
                            projectGroups: { [projectUuid] : { value: response.body.groups } }
                        });
                        const currentProject = this.store.selectSnapshot(CurrentProjectSelectors.project);
                        if (currentProject?.id === projectUuid) {
                            ctx.dispatch(new SetCurrentProjectGroupsAction(response.body.groups));
                        }
                    },
                    error: (error) => {
                        this.errorHandler.showMessage(error);
                    }
                })
            );
    }

    @Action(UpdateProjectAction)
    updateProjectAction(
        ctx: StateContext<ProjectsStateModel>,
        { projectUuid, projectData }: UpdateProjectAction
    ) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.admin.projectsEndpoint.updateProject(projectUuid, projectData)
            .pipe(
                take(1),
                map((response: ApiResponseData<ProjectResponse> | ApiResponseError) => {
                    return response as ApiResponseData<ProjectResponse>;
                }),
                tap({
                    next: (response: ApiResponseData<ProjectResponse>) => {
                        ctx.dispatch(new LoadAllProjectsAction());
                        const currentProject = this.store.selectSnapshot(CurrentProjectSelectors.project);
                        if (currentProject?.id === projectUuid) {
                            const user = this.store.selectSnapshot(UserSelectors.user) as ReadUser;
                            const userProjectGroups = this.store.selectSnapshot(UserSelectors.userProjectAdminGroups);
                            const isProjectAdmin = this.projectService.isProjectAdminOrSysAdmin(user, userProjectGroups, response.body.project.id);
                            const isProjectMember = this.projectService.isProjectMember(user, userProjectGroups, response.body.project.id);
                            ctx.dispatch(new SetCurrentProjectAction(response.body.project, isProjectAdmin, isProjectMember));
                        }
                        
                        return response.body.project;
                    },
                    error: (error) => {
                        this.errorHandler.showMessage(error);
                    }
                })
            );
    }
}
