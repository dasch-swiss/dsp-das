import { Inject, Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import {
    SetUserAction,
    LogUserOutAction,
    SetReadUserAction,
    LoadUserAction,
} from './user.actions';
import { UserStateModel } from './user.state-model';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, User, UserResponse } from '@dasch-swiss/dsp-js';

const defaults = {
    isLoading: false,
    user: null,
    readUser: null
};

@State<UserStateModel>({
    defaults,
    name: 'user',
})
@Injectable()
export class UserState {
    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
    ) {}

    @Action(LoadUserAction)
    loadUser(
        ctx: StateContext<UserStateModel>,
        { username }: LoadUserAction
    ) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.admin.usersEndpoint
            .getUserByUsername(username)
            .pipe(
                take(1),
                map(
                    (
                        response:
                            | ApiResponseData<UserResponse>
                            | ApiResponseError
                    ) => {
                        if (response instanceof ApiResponseData) {
                            ctx.patchState({ ...ctx.getState(), isLoading: false, user: response.body.user });
                            return response.body.user;
                        } else {
                            console.error(response);
                            return new User;
                        }
                })
            )
    }

    @Action(SetUserAction)
    setUser(
        ctx: StateContext<UserStateModel>,
        { user }: SetUserAction
    ) {
        ctx.setState({ ...ctx.getState(), isLoading: false, user });
    }

    @Action(SetReadUserAction)
    setReadUser(
        ctx: StateContext<UserStateModel>,
        { readUser }: SetReadUserAction
    ) {
        ctx.patchState({ isLoading: true });
        ctx.setState({ ...ctx.getState(), isLoading: false, readUser });
    }

    @Action(LogUserOutAction)
    logUserOut(ctx: StateContext<UserStateModel>) {
        return of(ctx.getState()).pipe(
            map(currentState => {
               ctx.patchState(defaults);
               return currentState;
            })
        );
    }
}
