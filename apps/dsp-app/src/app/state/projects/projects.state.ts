import { Inject, Injectable } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import { ProjectsStateModel } from './projects.state-model';
import { LoadUserProjectsAction as LoadUserOtherProjectsAction } from './projects.actions';
import { UserSelectors } from '../user/user.selectors';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, ProjectsResponse, ReadUser } from '@dasch-swiss/dsp-js';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';

const defaults = {
    isLoading: false,
    userOtherActiveProjects: [],
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
        private _errorHandler: AppErrorHandler,
    ) {}

    @Action(LoadUserOtherProjectsAction, { cancelUncompleted: true })
    loadUserProjects(
        ctx: StateContext<ProjectsStateModel>,
        { }: LoadUserOtherProjectsAction
    ) {
        ctx.patchState({ isLoading: true });
        const userActiveProjects = this.store.selectSnapshot(UserSelectors.userActiveProjects);
        this._dspApiConnection.admin.projectsEndpoint
                .getProjects()
                .subscribe(
                    (
                        projectsResponse: ApiResponseData<ProjectsResponse>
                    ) => {
                        const otherProjects = [];
                        // get list of all projects the user is NOT a member of
                        for (const project of projectsResponse.body
                            .projects) {
                            if (
                                userActiveProjects.findIndex(
                                    (userProj) =>
                                        userProj.id === project.id
                                ) === -1
                            ) {
                                otherProjects.push(project);
                            }
                        }

                        ctx.setState({ ...ctx.getState(), isLoading: false, userOtherActiveProjects: otherProjects });
                    },
                    (error: ApiResponseError) => {
                        this._errorHandler.showMessage(error);
                    }
                );
    }
}
