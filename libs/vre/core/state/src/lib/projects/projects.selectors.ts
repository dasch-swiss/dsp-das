import { Params } from '@angular/router';
import { Constants, ProjectRestrictedViewSettings, ReadProject, ReadUser, StoredProject } from '@dasch-swiss/dsp-js';
import { RestrictedViewResponse } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspAppConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Selector } from '@ngxs/store';
import { ConfigState } from '../config.state';
import { ResourceSelectors } from '../resource/resource.selectors';
import { RouterSelectors } from '../router/router.selector';
import { UserSelectors } from '../user/user.selectors';
import { ProjectsState } from './projects.state';
import { ProjectsStateModel } from './projects.state-model';

export class ProjectsSelectors {
  // get list of all projects the user is NOT a member of
  @Selector([ProjectsState, UserSelectors.userActiveProjects])
  static otherProjects(state: ProjectsStateModel, userActiveProjects: StoredProject[]): StoredProject[] {
    return state.allProjects.filter(
      project => userActiveProjects.findIndex(userProj => userProj.id === project.id) === -1
    );
  }

  @Selector([ProjectsState])
  static allProjects(state: ProjectsStateModel): StoredProject[] {
    return state.allProjects;
  }

  @Selector([ProjectsState])
  static allProjectShortcodes(state: ProjectsStateModel): string[] {
    return state.allProjects.map(project => project.shortcode);
  }

  @Selector([ProjectsState])
  static isProjectsLoading(state: ProjectsStateModel): boolean {
    return state.isLoading;
  }

  @Selector([ProjectsState])
  static isMembershipLoading(state: ProjectsStateModel): boolean {
    return state.isMembershipLoading;
  }

  @Selector([ProjectsState])
  static hasLoadingErrors(state: ProjectsStateModel): boolean {
    return state.hasLoadingErrors;
  }

  @Selector([ProjectsState])
  static allActiveProjects(state: ProjectsStateModel): ReadProject[] {
    return state.allProjects
      .filter(project => project.status === true)
      .sort((a, b) => (a.longname || '').localeCompare(b.longname || ''));
  }

  @Selector([ProjectsState])
  static allInactiveProjects(state: ProjectsStateModel): ReadProject[] {
    return state.allProjects
      .filter(project => project.status === false)
      .sort((a, b) => (a.longname || '').localeCompare(b.longname || ''));
  }

  @Selector([ProjectsState])
  static allNotSystemProjects(state: ProjectsStateModel): StoredProject[] {
    return state.allProjects.filter(
      project =>
        project.status && project.id !== Constants.SystemProjectIRI && project.id !== Constants.DefaultSharedOntologyIRI
    );
  }

  @Selector([ProjectsState, RouterSelectors.params])
  static currentProject(state: ProjectsStateModel, params: Params | undefined): ReadProject | undefined {
    if (!params) return undefined;
    const uuid = params[`${RouteConstants.uuidParameter}`];
    const project = state.allProjects.find(p => ProjectService.IriToUuid(p.id) === uuid);
    return project;
  }

  @Selector([ProjectsState, RouterSelectors.params])
  static currentProjectsUuid(state: ProjectsStateModel, params: Params | undefined): string | undefined {
    if (!params) return undefined;
    return params[`${RouteConstants.uuidParameter}`];
  }

  @Selector([
    ProjectsState,
    ResourceSelectors.resource,
    UserSelectors.user,
    UserSelectors.userProjectAdminGroups,
    ConfigState.getConfig,
    RouterSelectors.params,
  ])
  static isCurrentProjectAdminSysAdminOrMember(
    state: ProjectsStateModel,
    resource: DspResource | null,
    user: ReadUser | null,
    userProjectGroups: string[],
    dspApiConfig: DspAppConfig,
    params: Params | undefined
  ): boolean | undefined {
    if (!user || !params) return false;
    const projectIri = ProjectService.getProjectIri(params, dspApiConfig, resource);
    if (!projectIri) return false;
    const isMember = ProjectService.IsProjectMemberOrAdminOrSysAdmin(user, userProjectGroups, projectIri);
    return isMember;
  }

  @Selector([
    ProjectsState,
    ResourceSelectors.resource,
    UserSelectors.user,
    UserSelectors.userProjectAdminGroups,
    ConfigState.getConfig,
    RouterSelectors.params,
  ])
  static isCurrentProjectAdminOrSysAdmin(
    state: ProjectsStateModel,
    resource: DspResource | null,
    user: ReadUser | null,
    userProjectGroups: string[],
    dspApiConfig: DspAppConfig,
    params: Params | undefined
  ): boolean | undefined {
    if (!user || !user.permissions || !params) return false;
    const isMemberOfSystemAdminGroup = user.permissions.groupsPerProject
      ? ProjectService.IsMemberOfSystemAdminGroup(user.permissions.groupsPerProject)
      : false;
    if (isMemberOfSystemAdminGroup) return true;
    const projectIri = ProjectService.getProjectIri(params, dspApiConfig, resource);
    if (!projectIri) return false;
    const isProjectAdmin = ProjectService.IsProjectAdminOrSysAdmin(user, userProjectGroups, projectIri);
    return isProjectAdmin;
  }

  @Selector([
    ProjectsState,
    ResourceSelectors.resource,
    UserSelectors.user,
    UserSelectors.userProjectAdminGroups,
    ConfigState.getConfig,
    RouterSelectors.params,
  ])
  static isCurrentProjectMember(
    state: ProjectsStateModel,
    resource: DspResource | null,
    user: ReadUser | null,
    userProjectGroups: string[],
    dspApiConfig: DspAppConfig,
    params: Params | undefined
  ): boolean | undefined {
    if (!user || !params) return false;
    const projectIri = ProjectService.getProjectIri(params, dspApiConfig, resource);
    if (!projectIri) return false;
    const isProjectMember = ProjectService.IsProjectMember(user, userProjectGroups, projectIri);
    return isProjectMember;
  }

  @Selector([ProjectsState, ResourceSelectors.resource, ConfigState.getConfig, RouterSelectors.params])
  static projectRestrictedViewSettings(
    state: ProjectsStateModel,
    resource: DspResource | null,
    dspApiConfig: DspAppConfig,
    params: Params | undefined
  ): ProjectRestrictedViewSettings | RestrictedViewResponse | undefined {
    if (!params) return undefined;
    const projectUuid = params[`${RouteConstants.uuidParameter}`];
    return !projectUuid || !state.projectRestrictedViewSettings[projectUuid]
      ? undefined
      : state.projectRestrictedViewSettings[projectUuid].value;
  }

  @Selector([ProjectsState, ResourceSelectors.resource, ConfigState.getConfig, RouterSelectors.params])
  static contextProject(
    state: ProjectsStateModel,
    resource: DspResource | null,
    dspApiConfig: DspAppConfig,
    params: Params | undefined
  ): ReadProject | undefined {
    if (!params) return undefined;
    const projectIri = ProjectService.getProjectIri(params, dspApiConfig, resource);
    if (!projectIri) return undefined;
    return state.allProjects.find(p => p.id === projectIri);
  }
}
