import { ClearProjectOntologiesAction } from './../ontologies/ontologies.actions';
import { Inject, Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { CurrentProjectStateModel } from './current-project.state-model';
import { ClearCurrentProjectAction as ClearCurrentProjectAction, SetCurrentProjectAction, SetCurrentProjectGroupsAction, SetCurrentProjectMembersAction } from './current-project.actions';

let defaults: CurrentProjectStateModel = {
    isLoading: false,
    hasLoadingErrors: false,
    project: undefined,
    members: [],
    groups: [],
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

    @Action(SetCurrentProjectMembersAction)
    setProjectMembersAction(
        ctx: StateContext<CurrentProjectStateModel>,
        { members }: SetCurrentProjectMembersAction
    ) {
        return ctx.setState({ ...ctx.getState(), members });
    }

    
    @Action(SetCurrentProjectGroupsAction)
    setProjectGroupsAction(
        ctx: StateContext<CurrentProjectStateModel>,
        { groups }: SetCurrentProjectGroupsAction
    ) {
        return ctx.setState({ ...ctx.getState(), groups });
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
