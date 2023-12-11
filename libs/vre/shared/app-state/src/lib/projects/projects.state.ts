import { Inject, Injectable } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import { ProjectsStateModel } from './projects.state-model';
import {
    AddUserToProjectMembershipAction,
    ClearProjectsAction,
    LoadProjectAction,
    LoadProjectGroupsAction,
    LoadProjectMembersAction,
    LoadProjectsAction,
    RemoveUserFromProjectAction,
    SetProjectMemberAction,
    UpdateProjectAction
} from './projects.actions';
import { UserSelectors } from '../user/user.selectors';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import {
    ApiResponseData,
    ApiResponseError,
    GroupsResponse,
    KnoraApiConnection,
    ProjectResponse,
    ReadGroup,
    ReadUser,
    UserResponse
} from '@dasch-swiss/dsp-js';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { concatMap, finalize, map, take, tap } from 'rxjs/operators';
import { produce } from 'immer';
import { EMPTY, of } from 'rxjs';
import { CurrentProjectSelectors } from '../current-project/current-project.selectors';
import {
    SetCurrentProjectAction,
    SetCurrentProjectByUuidAction,
    SetCurrentProjectGroupsAction
} from '../current-project/current-project.actions';
import { IKeyValuePairs } from '../model-interfaces';
import { ProjectsSelectors } from './projects.selectors';
import { SetUserAction } from '../user/user.actions';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';

const defaults: ProjectsStateModel = {
    isLoading: false,
    hasLoadingErrors: false,
    allProjects: [],
    readProjects: [],
    projectMembers: {},
    projectGroups: {}
};

@State<ProjectsStateModel>({
    defaults,
    name: 'projects'
})
@Injectable()
export class ProjectsState {
    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _projectsApiService: ProjectApiService,
        private store: Store,
        private errorHandler: AppErrorHandler,
        private projectService: ProjectService,
        private _store: Store
    ) {
    }

    @Action(LoadProjectsAction, { cancelUncompleted: true })
    loadProjects(
        ctx: StateContext<ProjectsStateModel>) {
        ctx.patchState({ isLoading: true });
        return this._projectsApiService.list()
            .subscribe(response => {
                    ctx.setState({
                        ...ctx.getState(),
                        isLoading: false,
                        allProjects: response.projects
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
        this._projectsApiService.get(projectIri)
            .pipe(
                take(1),
                tap({
                    next: (response) => {
                        const project = response.project;

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
                        ctx.dispatch(new SetUserAction(response.body.user));
                        ctx.patchState({ isLoading: false });
                    },
                    error: (error) => {
                        this.errorHandler.showMessage(error);
                    }
                })
            );
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
                        ctx.dispatch(new SetUserAction(response.body.user));
                        ctx.patchState({ isLoading: false });
                    },
                    error: (error) => {
                        ctx.patchState({ hasLoadingErrors: true });
                        this.errorHandler.showMessage(error);
                    }
                })
            );
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
        return this._projectsApiService.getMembersForProject(projectIri)
            .pipe(tap({
                    next: response => {
                        ctx.setState({
                            ...ctx.getState(),
                            isLoading: false,
                            projectMembers: { [projectIri]: { value: response.members } }
                        });
                    },
                    error: (error) => {
                        ctx.patchState({ hasLoadingErrors: true });
                        this.errorHandler.showMessage(error);
                    }
                })
            );
    }

    @Action(LoadProjectGroupsAction)
    loadProjectGroupsAction(ctx: StateContext<ProjectsStateModel>) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.admin.groupsEndpoint.getGroups()
            .pipe(
                take(1),
                map((groupsResponse: ApiResponseData<GroupsResponse> | ApiResponseError) => {
                    return groupsResponse as ApiResponseData<GroupsResponse>;
                }),
                tap({
                    next: (response: ApiResponseData<GroupsResponse>) => {
                        const groups: IKeyValuePairs<ReadGroup> = {};
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
            return this._projectsApiService.update(projectUuid, projectData)
            .pipe(
                take(1),
                tap({
                    next: response => {
                        ctx.dispatch(new LoadProjectsAction());
                        const currentProject = this.store.selectSnapshot(CurrentProjectSelectors.project);
                        if (currentProject?.id === projectUuid) {
                            const user = this.store.selectSnapshot(UserSelectors.user) as ReadUser;
                            const userProjectGroups = this.store.selectSnapshot(UserSelectors.userProjectAdminGroups);
                            const isProjectAdmin = this.projectService.isProjectAdminOrSysAdmin(user, userProjectGroups, response.project.id);
                            const isProjectMember = this.projectService.isProjectMember(user, userProjectGroups, response.project.id);
                            ctx.dispatch(new SetCurrentProjectAction(response.project, isProjectAdmin, isProjectMember));
                        }

                        return response.project;
                    }})
            );
    }

    @Action(SetProjectMemberAction)
    setProjectMember(ctx: StateContext<ProjectsStateModel>,
                     { member }: SetProjectMemberAction
    ) {
        const state = ctx.getState();
        Object.keys(state.projectMembers).forEach((projectId) => {
            const index = state.projectMembers[projectId].value.findIndex(u => u.id === member.id);
            if (index > -1) {
                state.projectMembers[projectId].value[index] = member;
            }
        });

        ctx.setState({ ...state });
    }
}
