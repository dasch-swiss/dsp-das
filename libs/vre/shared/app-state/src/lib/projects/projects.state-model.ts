import { ReadGroup, ReadProject, ReadUser, StoredProject } from "@dasch-swiss/dsp-js";

export interface IReadUserKeyValuePairs {
    [key: string]: { value: ReadUser[] };
}

export interface IReadGroupKeyValuePairs {
    [key: string]: { value: ReadGroup[] };
}
 
export class ProjectsStateModel {
    isLoading: boolean = false;
    hasLoadingErrors: boolean = false;
    userOtherActiveProjects: StoredProject[] = [];
    allProjects: ReadProject[] = [];
    readProjects: ReadProject[] = [];
    projectMembers: IReadUserKeyValuePairs = {};
    projectGroups: IReadGroupKeyValuePairs = {};
}
