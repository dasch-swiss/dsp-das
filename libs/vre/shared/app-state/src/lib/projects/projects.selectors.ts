import { Selector } from '@ngxs/store';
import { ProjectsState } from './projects.state';
import { ProjectsStateModel } from './projects.state-model';
import { StoredProject } from '@dasch-swiss/dsp-js';

export class ProjectsSelectors {
    @Selector([ProjectsState])
    static userOtherActiveProjects(state: ProjectsStateModel): StoredProject[] {
        return state.userOtherActiveProjects;
    }

    @Selector([ProjectsState])
    static allProjects(state: ProjectsStateModel): StoredProject[] {
        return state.allProjects;
    }

    @Selector([ProjectsState])
    static allActiveProjects(state: ProjectsStateModel): StoredProject[] {
        return state.allProjects.filter(project => project.status !== false);
    }

    @Selector([ProjectsState])
    static isProjectsLoading(state: ProjectsStateModel): boolean {
        return state.isLoading;
    }
}
