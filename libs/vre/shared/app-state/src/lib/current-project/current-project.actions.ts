import { ReadGroup, ReadProject, ReadUser } from "@dasch-swiss/dsp-js";

export class SetCurrentProjectMembersAction {
    static readonly type = '[CurrentProject] Set Current Project Members Action';
    constructor(public members: ReadUser[]) {}
}

export class SetCurrentProjectGroupsAction {
    static readonly type = '[CurrentProject] Set Current Project Groups Action';
    constructor(public groups: ReadGroup[]) {}
}

export class SetCurrentProjectAction {
    static readonly type = '[CurrentProject] Set Current Project';
    constructor(
        public readProject: ReadProject, 
        public isProjectAdmin: boolean = false, 
        public isProjectMember: boolean = false
    ) {}
}

export class ClearCurrentProjectAction {
    static readonly type = '[CurrentProject] Clear Current Project';
    constructor() {}
}