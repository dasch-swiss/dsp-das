export class LoadUserProjectsAction {
    static readonly type = '[Projects] Load User Projects';
    constructor() {}
}

export class LoadAllProjectsAction {
    static readonly type = '[Projects] Load All Projects';
    constructor() {}
}

export class SetProjectMembersAction {
    static readonly type = '[Projects] Set Project Members Action';
    constructor(public projectUuid: string) {}
}

export class SetProjectGroupsAction {
    static readonly type = '[Projects] Set Project Groups Action';
    constructor(public projectUuid: string) {}
}

export class LoadProjectAction {
    static readonly type = '[Projects] Load Project';
    constructor(public projectUuid: string) {}
}

export class LogProjectsOutAction {
    static readonly type = '[Projects] Log projects out';
    constructor() {}
}