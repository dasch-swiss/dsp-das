import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Selector } from '@ngxs/store';
import { ProjectsState } from './projects.state';
import { ProjectsStateModel } from './projects.state-model';
import { ReadGroup, ReadProject, ReadUser, StoredProject } from '@dasch-swiss/dsp-js';
import { IKeyValuePairs } from '../model-interfaces';

export class ProjectsSelectors {
    static otherProjects(state: ProjectsStateModel): StoredProject[] {
        return state.otherProjects;
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
    
    @Selector([UserSelectors.isLoggedIn, ProjectsSelectors.allActiveProjects, UserSelectors.userActiveProjects])
    static activeProjects(isLoggedIn: boolean, activeProjects: ReadProject[], userActiveProjects: StoredProject[]): StoredProject[] {
        return isLoggedIn === true ? userActiveProjects : activeProjects;
    }

    @Selector([UserSelectors.isLoggedIn, ProjectsSelectors.allInactiveProjects, UserSelectors.userInActiveProjects])
    static inactiveProjects(isLoggedIn: boolean, inActiveProjects: ReadProject[], userInactiveProjects: StoredProject[]): StoredProject[] {
        return isLoggedIn === true ? userInactiveProjects : inActiveProjects;
    }
}
