import { ReadGroup, ReadProject, ReadUser, StoredProject } from "@dasch-swiss/dsp-js";
import { IKeyValuePairs } from "../model-interfaces";

export class ProjectsStateModel {
    isLoading: boolean = false;
    hasLoadingErrors: boolean = false;
    userOtherActiveProjects: StoredProject[] = [];
    allProjects: ReadProject[] = [];
    readProjects: ReadProject[] = [];
    projectMembers: IKeyValuePairs<ReadUser> = {};
    projectGroups: IKeyValuePairs<ReadGroup> = {};
}
