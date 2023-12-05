import { Selector } from '@ngxs/store';
import { UserState } from './user.state';
import { UserStateModel } from './user.state-model';
import { ReadUser, User } from '@dasch-swiss/dsp-js';
import { StoredProject } from "@dasch-swiss/dsp-js/src/models/admin/stored-project";
import { Auth } from '@dasch-swiss/vre/shared/app-config';

export class UserSelectors {
    @Selector([UserState])
    static isLoading(state: UserStateModel): boolean | undefined {
        return state.isLoading;
    }

    @Selector([UserState])
    static allUsers(state: UserStateModel): ReadUser[] {
        return state.allUsers;
    }

    @Selector([UserState])
    static activeUsers(state: UserStateModel): ReadUser[] {
        return state.allUsers.filter((user: ReadUser) => user.status === true);
    }

    @Selector([UserState])
    static inactiveUsers(state: UserStateModel): ReadUser[] {
        return state.allUsers.filter((user: ReadUser) => user.status !== true);
    }

    @Selector([UserState])
    static isLoggedIn(state: UserStateModel): boolean {
        return !state.isLoading
            && !!localStorage.getItem(Auth.AccessToken)
            && state.user !== null
            && state.user?.username !== '';
    }

    @Selector([UserState])
    static user(state: UserStateModel): User | ReadUser | null | undefined {
        return state.user;
    }

    // Selector for getting one specific user by username. Not the user currently logged in!
    @Selector([UserState])
    static userByUsername(state: UserStateModel): (username: string) => ReadUser | undefined {
        return (username: string) => state.allUsers.find((user: ReadUser) => user.username === username);
    }

    @Selector([UserState])
    static username(state: UserStateModel): string | null | undefined {
        return state.user?.username;
    }

    @Selector([UserState])
    static language(state: UserStateModel): string | null | undefined {
        return state.user?.lang;
    }

    @Selector([UserState])
    static isMemberOfSystemAdminGroup(state: UserStateModel): boolean {
        return state.isMemberOfSystemAdminGroup;
    }

    @Selector([UserState])
    static userProjectAdminGroups(state: UserStateModel): string[] {
        return state.userProjectAdminGroups;
    }

    @Selector([UserState])
    static isSysAdmin(state: UserStateModel): boolean {
        return state.isMemberOfSystemAdminGroup === true
            ? true
            : state.user && state.user.systemAdmin
                ? state.user.systemAdmin
                : false;
    }

    @Selector([UserState])
    static displayName(state: UserStateModel): string | null {
        return state.user?.familyName && state.user?.givenName
            ? `${state.user.familyName} ${state.user.givenName}`
            : null;
    }

    @Selector([UserState])
    static userProjects(state: UserStateModel): StoredProject[] {
        return state.user ? (state.user as ReadUser).projects : [];
    }

    @Selector([UserState])
    static userActiveProjects(state: UserStateModel): StoredProject[] {
        return state.user ? (state.user as ReadUser).projects.filter((project: StoredProject) => project.status === true) : [];
    }

    // list of archived (deleted) projects
    @Selector([UserState])
    static userInactiveProjects(state: UserStateModel): StoredProject[] {
        return state.user ? (state.user as ReadUser).projects.filter((project: StoredProject) => !project.status) : [];
    }
}
