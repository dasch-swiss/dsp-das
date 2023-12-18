import { Selector } from '@ngxs/store';
import { ProjectsState } from './projects.state';
import { ProjectsStateModel } from './projects.state-model';
import {
  Constants,
  ReadGroup,
  ReadProject,
  ReadUser,
  StoredProject,
} from '@dasch-swiss/dsp-js';
import { IKeyValuePairs } from '../model-interfaces';
import { UserSelectors } from '../user/user.selectors';
import { RouterSelectors } from '../router/router.selector';
import { Params } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';

export class ProjectsSelectors {
  // get list of all projects the user is NOT a member of
  @Selector([ProjectsState, UserSelectors.userActiveProjects])
  static otherProjects(
    state: ProjectsStateModel,
    userActiveProjects: StoredProject[]
  ): StoredProject[] {
    return state.allProjects.filter(
      project =>
        userActiveProjects.findIndex(userProj => userProj.id === project.id) ===
        -1
    );
  }

  @Selector([ProjectsState])
  static allProjects(state: ProjectsStateModel): StoredProject[] {
    return state.allProjects;
  }

  @Selector([ProjectsState])
  static isProjectsLoading(state: ProjectsStateModel): boolean {
    return state.isLoading;
  }

  @Selector([ProjectsState])
  static hasLoadingErrors(state: ProjectsStateModel): boolean {
    return state.hasLoadingErrors;
  }

  @Selector([ProjectsState])
  static readProjects(state: ProjectsStateModel): ReadProject[] {
    return state.readProjects;
  }

  @Selector([ProjectsState])
  static projectMembers(state: ProjectsStateModel): IKeyValuePairs<ReadUser> {
    return state.projectMembers;
  }

  @Selector([ProjectsState])
  static projectGroups(state: ProjectsStateModel): IKeyValuePairs<ReadGroup> {
    return state.projectGroups;
  }

  @Selector([ProjectsState])
  static allActiveProjects(state: ProjectsStateModel): ReadProject[] {
    return state.allProjects.filter(project => project.status === true);
  }

  @Selector([ProjectsState])
  static allInactiveProjects(state: ProjectsStateModel): ReadProject[] {
    return state.allProjects.filter(project => project.status === false);
  }

  @Selector([ProjectsState])
  static allNotSystemProjects(state: ProjectsStateModel): StoredProject[] {
    return state.allProjects.filter(
      project =>
        project.status &&
        project.id !== Constants.SystemProjectIRI &&
        project.id !== Constants.DefaultSharedOntologyIRI
    );
  }

  @Selector([ProjectsState, RouterSelectors.params])
  static currentProject(
    state: ProjectsStateModel,
    params: Params
  ): ReadProject | undefined {
    const uuid = params[`${RouteConstants.uuidParameter}`];
    const project = state.readProjects.find(
      project => ProjectService.IriToUuid(project.id) === uuid
    );
    return project;
  }

  @Selector([
    ProjectsState,
    UserSelectors.user,
    UserSelectors.userProjectAdminGroups,
    RouterSelectors.params,
  ])
  static isCurrentProjectAdmin(
    state: ProjectsStateModel,
    user: ReadUser,
    userProjectGroups: string[],
    params: Params
  ): boolean | undefined {
    const projectId = params[`${RouteConstants.uuidParameter}`];
    const isProjectAdmin = ProjectService.IsProjectAdminOrSysAdmin(
      user,
      userProjectGroups,
      projectId
    );
    return isProjectAdmin;
  }

  @Selector([
    ProjectsState,
    UserSelectors.user,
    UserSelectors.userProjectAdminGroups,
    RouterSelectors.params,
  ])
  static isCurrentProjectMember(
    state: ProjectsStateModel,
    user: ReadUser,
    userProjectGroups: string[],
    params: Params
  ): boolean | undefined {
    const projectId = params[`${RouteConstants.uuidParameter}`];
    const isProjectMember = ProjectService.IsProjectMember(
      user,
      userProjectGroups,
      projectId
    );
    return isProjectMember;
  }
}
