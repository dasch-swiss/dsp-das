import { ReadUser, StoredProject } from "@dasch-swiss/dsp-js";

export class ProjectsStateModel {
    isLoading: boolean;
    userOtherActiveProjects: StoredProject[];
}
