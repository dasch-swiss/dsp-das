import { ReadProject, StoredProject } from "@dasch-swiss/dsp-js";

export class ProjectsStateModel {
    isLoading: boolean = false;
    hasLoadingErrors: boolean = false;
    userOtherActiveProjects: StoredProject[] = [];
    allProjects: ReadProject[] = [];
    readProjects: ReadProject[] = [];
}
