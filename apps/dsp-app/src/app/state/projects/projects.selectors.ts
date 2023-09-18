import { Selector } from '@ngxs/store';
import { ProjectsState } from './projects.state';
import { ProjectsStateModel } from './projects.state-model';
import { StoredProject } from '@dasch-swiss/dsp-js';

export class ProjectsSelectors {
    @Selector([ProjectsState])
    static userOtherActiveProjects(state: ProjectsStateModel): StoredProject[] {
        return state.userOtherActiveProjects;
    }
}
