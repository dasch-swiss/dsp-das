import { Inject, Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
    SetUserAction,
    LogUserOutAction,
    LoadUserAction,
    SetUserProjectGroupsAction as SetUserProjectGroupsDataAction,
} from './user.actions';
import { UserStateModel } from './user.state-model';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ApiResponseData, ApiResponseError, Constants, KnoraApiConnection, User, UserResponse } from '@dasch-swiss/dsp-js';

const defaults = <UserStateModel>{
    isLoading: false,
    user: null,
    userProjectGroups: [],
    isMemberOfSystemAdminGroup: false
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
                            ctx.dispatch(new SetUserProjectGroupsDataAction(response.body.user));
                            return response.body.user;
                        } else {
                            console.error(response);
                            return new User;
                        }
                })
            )
    }

    @Action(SetUserAction)
    setUser(ctx: StateContext<UserStateModel>,
        { user }: SetUserAction
    ) {
        ctx.setState({ ...ctx.getState(), isLoading: false, user });
        ctx.dispatch(new SetUserProjectGroupsDataAction(user));
    }

    @Action(SetUserProjectGroupsDataAction)
    setUserProjectGroupsData(ctx: StateContext<UserStateModel>,
        { user }: SetUserProjectGroupsDataAction
    ) {
        let isMemberOfSystemAdminGroup = false;
        const userProjectGroups: string[] = [];

        // get permission information: a) is user sysadmin? b) get list of project iri's where user is project admin
        const groupsPerProject = user.permissions.groupsPerProject;

        if (groupsPerProject) {
            const groupsPerProjectKeys: string[] = Object.keys(groupsPerProject);

            for (const key of groupsPerProjectKeys) {
                if (key === Constants.SystemProjectIRI) {
                    isMemberOfSystemAdminGroup = groupsPerProject[key].indexOf(Constants.SystemAdminGroupIRI) > -1;
                }

                if (groupsPerProject[key].indexOf(Constants.ProjectAdminGroupIRI) > -1) {
                    userProjectGroups.push(key);
                }
            }
        }

        ctx.setState({ ...ctx.getState(), userProjectGroups, isMemberOfSystemAdminGroup});
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
