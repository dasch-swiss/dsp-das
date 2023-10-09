import { ReadProject } from "@dasch-swiss/dsp-js";

export class LoadCurrentProjectMembersAction {
    static readonly type = '[CurrentProject] Load Current Project Members Action';
    constructor(public projectUuid: string) {}
}

export class LoadCurrentProjectGroupsAction {
    static readonly type = '[CurrentProject] Load Current Project Groups Action';
    constructor(public projectUuid: string) {}
}

export class SetCurrentProjectAction {
    static readonly type = '[CurrentProject] Set Current Project';
    constructor(
        public readProject: ReadProject, 
        public isProjectAdmin: boolean = false, 
        public isProjectMember: boolean = false
    ) {}
}

export class LogCurrentProjectOutAction {
    static readonly type = '[CurrentProject] Log user out';
    constructor() {}
}