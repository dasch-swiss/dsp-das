import { ClearProjectOntologiesAction } from './../ontologies/ontologies.actions';
import { Inject, Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ApiResponseData, ApiResponseError, GroupsResponse, KnoraApiConnection, MembersResponse } from '@dasch-swiss/dsp-js';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { map, take, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CurrentProjectStateModel } from './current-project.state-model';
import { LoadCurrentProjectGroupsAction, LoadCurrentProjectMembersAction, LogCurrentProjectOutAction as ClearCurrentProjectAction, SetCurrentProjectAction } from './current-project.actions';

let defaults: CurrentProjectStateModel = {
    isLoading: false,
    hasLoadingErrors: false,
    project: undefined,
    projectMembers: {},
    projectGroups: {},
    isProjectAdmin: false,
    isProjectMember: false,
};

@State<CurrentProjectStateModel>({
    defaults,
    name: 'currentProject',
})
@Injectable()
export class CurrentProjectState {
    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: AppErrorHandler,
    ) {}

    @Action(LoadCurrentProjectMembersAction)
    loadProjectMembersAction(
        ctx: StateContext<CurrentProjectStateModel>,
        { projectUuid }: LoadCurrentProjectMembersAction
    ) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.admin.projectsEndpoint.getProjectMembersByIri(projectUuid)
            .pipe(
                take(1),
                map((membersResponse: ApiResponseData<MembersResponse> | ApiResponseError) => {
                    return membersResponse as ApiResponseData<MembersResponse>;
                }),
                tap({
                    next: (response: ApiResponseData<MembersResponse>) => 
                        ctx.setState({ 
                            ...ctx.getState(), 
                            isLoading: false,
                            projectMembers: { [projectUuid] : { value: response.body.members } }
                        }),
                    error: (error) => {
                        this._errorHandler.showMessage(error);
                    }
                })
            );
    }

    @Action(LoadCurrentProjectGroupsAction)
    loadProjectGroupsAction(
        ctx: StateContext<CurrentProjectStateModel>,
        { projectUuid }: LoadCurrentProjectGroupsAction
    ) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.admin.groupsEndpoint.getGroups()
            .pipe(
                take(1),
                map((groupsResponse: ApiResponseData<GroupsResponse> | ApiResponseError) => {
                    return groupsResponse as ApiResponseData<GroupsResponse>;
                }),
                tap({
                    next: (response: ApiResponseData<GroupsResponse>) => 
                    ctx.setState({ 
                        ...ctx.getState(), 
                        isLoading: false, 
                        projectGroups: { [projectUuid] : { value: response.body.groups } }
                    }),
                    error: (error) => {
                        this._errorHandler.showMessage(error);
                    }
                })
            );
    }
    
    @Action(SetCurrentProjectAction, { cancelUncompleted: true })
    setCurrentProjectAction(
        ctx: StateContext<CurrentProjectStateModel>,
        { 
            readProject,
            isProjectAdmin,
            isProjectMember
         }: SetCurrentProjectAction
    ) {
        return ctx.setState({ ...defaults, project: readProject, isProjectAdmin, isProjectMember });
    }
    
    @Action(ClearCurrentProjectAction)
    clearCurrentProject(ctx: StateContext<CurrentProjectStateModel>) {
        return of(ctx.getState()).pipe(
            map(currentState => {
                const projectUuid = ctx.getState().project?.id;
                if (projectUuid) {
                    ctx.dispatch(new ClearProjectOntologiesAction(projectUuid))
                }
                
                ctx.patchState(defaults);
                return currentState;
            })
        );
    }
}
