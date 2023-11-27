import { ReadGroup, ReadProject, ReadUser } from "@dasch-swiss/dsp-js";
import { IKeyValuePairs } from "../model-interfaces";
 
export class CurrentProjectStateModel {
    isLoading: boolean = false;
    hasLoadingErrors: boolean = false;
    project: ReadProject | undefined;
    isProjectAdmin: boolean = false;
    isProjectMember: boolean = false;
    groups: ReadGroup[] = [];
}
