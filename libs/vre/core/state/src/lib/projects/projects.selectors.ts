import { Params } from '@angular/router';
import { ReadProject, StoredProject } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Selector } from '@ngxs/store';
import { RouterSelectors } from '../router/router.selector';
import { ProjectsState } from './projects.state';
import { ProjectsStateModel } from './projects.state-model';

export class ProjectsSelectors {
  @Selector([ProjectsState])
  static allProjects(state: ProjectsStateModel): StoredProject[] {
    return state.allProjects;
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
}
