import { Selector } from '@ngxs/store';
import { UserState } from './user.state';
import { UserStateModel } from './user.state-model';
import { ReadUser, User } from '@dasch-swiss/dsp-js';
import { StoredProject } from "@dasch-swiss/dsp-js/src/models/admin/stored-project";

export class UserSelectors {
    @Selector([UserState])
    static isLoading(state: UserStateModel): boolean {
        return state.isLoading;
    }

    @Selector([UserState])
    static user(state: UserStateModel): User | ReadUser {
        return state.user;
    }

    @Selector([UserState])
    static username(state: UserStateModel): string | null {
        return state.user?.username;
    }

    @Selector([UserState])
    static isSysAdmin(state: UserStateModel): boolean {
        return state.user && state.user.systemAdmin ? state.user.systemAdmin : false;
    }
    
    @Selector([UserState])
    static displayName(state: UserStateModel): string | null {
        return state.user?.familyName && state.user?.givenName
            ? `${state.user.familyName} ${state.user.givenName}`
            : null;
    }

    @Selector([UserState])
    static userActiveProjects(state: UserStateModel): StoredProject[] {
        return state.user ? (state.user as ReadUser).projects.filter((project: StoredProject) => project.status !== false) : [];
    }
}
