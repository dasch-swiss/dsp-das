import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import { Inject, Injectable } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import { ProjectsStateModel } from './projects.state-model';
import { LoadProjectsAction, LoadProjectAction, ClearProjectsAction, RemoveUserFromProjectAction, AddUserToProjectMembershipAction, LoadProjectMembersAction, LoadProjectGroupsAction, UpdateProjectAction } from './projects.actions';
import { UserSelectors } from '../user/user.selectors';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ApiResponseData, ApiResponseError, GroupsResponse, KnoraApiConnection, MembersResponse, ProjectResponse, ProjectsResponse, ReadGroup, ReadUser, UserResponse } from '@dasch-swiss/dsp-js';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { concatMap, finalize, map, take, tap } from 'rxjs/operators';
import { produce } from 'immer';
import { EMPTY, of } from 'rxjs';
import { CurrentProjectSelectors } from '../current-project/current-project.selectors';
import { SetCurrentProjectAction, SetCurrentProjectByUuidAction, SetCurrentProjectGroupsAction, SetCurrentProjectMembersAction } from '../current-project/current-project.actions';
import { IKeyValuePairs } from '../model-interfaces';
import { ProjectsSelectors } from './projects.selectors';

let defaults: ProjectsStateModel = {
    isLoading: false,
    hasLoadingErrors: false,
    otherProjects: [],
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
        private projectService: ProjectService,
        private _store: Store,
    ) {}

    @Action(LoadProjectsAction, { cancelUncompleted: true })
    loadProjects(
        ctx: StateContext<ProjectsStateModel>,
        { }: LoadProjectsAction
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
            .subscribe((projectsResponse: ApiResponseData<ProjectsResponse>) => {
                    // get list of all projects the user is NOT a member of
                    const otherProjects = projectsResponse.body.projects.filter(project => 
                        userActiveProjects.findIndex((userProj) => userProj.id === project.id) === -1);

                    ctx.setState({ 
                        ...ctx.getState(), 
                        isLoading: false, 
                        allProjects: projectsResponse.body.projects,
                        otherProjects,
                    });
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
        { projectUuid, isCurrentProject }: LoadProjectAction
    ) {
        ctx.patchState({ isLoading: true });
    
        const projectIri = this.projectService.uuidToIri(projectUuid);
        // get current project data, project members and project groups
        // and set the project state here
        return this._dspApiConnection.admin.projectsEndpoint
            .getProjectByIri(projectIri)
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
                }),
                concatMap(() => ctx.dispatch([
                    new LoadProjectMembersAction(projectUuid), 
                    new LoadProjectGroupsAction(projectUuid)
                ])),
                concatMap(() => { 
                    if (isCurrentProject) {
                        const projectGroups = this.store.selectSnapshot(ProjectsSelectors.projectGroups);
                        return ctx.dispatch([
                            new SetCurrentProjectByUuidAction(projectUuid), 
                            new SetCurrentProjectGroupsAction(projectGroups[projectIri]?.value)
                        ]);
                    }
                    
                    return EMPTY;
                }),
                finalize(() => {
                    ctx.patchState({ isLoading: false });
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
        if (!this._store.selectSnapshot(UserSelectors.isLoggedIn)) {
            return;
        }

        ctx.patchState({ isLoading: true });
        const projectIri = this.projectService.uuidToIri(projectUuid);
        return this._dspApiConnection.admin.projectsEndpoint.getProjectMembersByIri(projectIri)
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
                            projectMembers: { [projectIri] : { value: response.body.members } }
                        });

                        const currentProject = this.store.selectSnapshot(CurrentProjectSelectors.project);
                        if (currentProject?.id === projectIri) {
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
                        const projectIri = this.projectService.uuidToIri(projectUuid);
                        let groups: IKeyValuePairs<ReadGroup> = {};
                        response.body.groups.forEach(group => {
                            const projectId = group.project?.id as string;
                            if (!groups[projectId]) {
                                groups[projectId] = { value: [] };
                            }
                            
                            groups[projectId].value = [...groups[projectId].value, group];
                        });

                        ctx.setState({ 
                            ...ctx.getState(), 
                            isLoading: false, 
                            projectGroups: groups
                        });
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
                        ctx.dispatch(new LoadProjectsAction());
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
