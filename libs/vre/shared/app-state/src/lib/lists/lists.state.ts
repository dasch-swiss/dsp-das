import { Inject, Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, ListsResponse } from '@dasch-swiss/dsp-js';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { ListsStateModel } from './lists.state-model';
import { ClearListsAction, GetListsInProjectAction } from './lists.actions';
import { of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

let defaults: ListsStateModel = {
    isLoading: false,
    listsInProject: [],
};

@State<ListsStateModel>({
    defaults,
    name: 'lists',
})
@Injectable()
export class ListsState {
    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: AppErrorHandler,
    ) {}

    @Action(GetListsInProjectAction)
    getListsInProject(
        ctx: StateContext<ListsStateModel>,
        { projectId }: GetListsInProjectAction
    ) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.admin.listsEndpoint
            .getListsInProject(projectId)
            .pipe(
                take(1),
                map((response: ApiResponseData<ListsResponse> | ApiResponseError) => { 
                    return response as ApiResponseData<ListsResponse>;
                }),
                tap({
                    next: (response: ApiResponseData<ListsResponse>) => {
                        ctx.setState({ ...ctx.getState(), isLoading: false, listsInProject: response.body.lists });
                    },
                    error: (error: ApiResponseError) => {
                        this._errorHandler.showMessage(error);
                    }
                })
            );
    }

    @Action(ClearListsAction)
    clearCurrentProject(ctx: StateContext<ListsStateModel>) {
        return of(ctx.getState()).pipe(
            map(currentState => {
                ctx.patchState(defaults);
                return currentState;
            })
        );
    }
}
