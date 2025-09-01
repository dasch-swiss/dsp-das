import { ReadUser } from '@dasch-swiss/dsp-js';
import { StoredProject } from '@dasch-swiss/dsp-js/src/models/admin/stored-project';
import { Selector } from '@ngxs/store';
import { UserState } from './user.state';
import { UserStateModel } from './user.state-model';

export class UserSelectors {
  @Selector([UserState])
  static isLoggedIn(state: UserStateModel) {
    return state.user !== null;
  }

  @Selector([UserState])
  static user(state: UserStateModel): ReadUser | null {
    return state.user;
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
  static userActiveProjects(state: UserStateModel): StoredProject[] {
    return state.user
      ? (state.user as ReadUser).projects.filter((project: StoredProject) => project.status === true)
      : [];
  }

  // list of archived (deleted) projects
  @Selector([UserState])
  static userInactiveProjects(state: UserStateModel): StoredProject[] {
    return state.user ? (state.user as ReadUser).projects.filter((project: StoredProject) => !project.status) : [];
  }
}
