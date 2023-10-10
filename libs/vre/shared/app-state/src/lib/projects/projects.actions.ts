export class LoadUserProjectsAction {
    static readonly type = '[Projects] Load User Projects';
    constructor() {}
}

export class LoadAllProjectsAction {
    static readonly type = '[Projects] Load All Projects';
    constructor() {}
}

export class LoadProjectAction {
    static readonly type = '[Projects] Load Project';
    constructor(public projectUuid: string) {}
}

export class ClearProjectsAction {
    static readonly type = '[Projects] Log projects out';
    constructor() {}
}

export class RemoveUserFromProjectAction {
    static readonly type = '[Projects] Remove User From Project';
    constructor(public userId: string, public projectId: string) {}
}

export class AddUserToProjectMembershipAction {
    static readonly type = '[Projects] Add User To Project Membership';
    constructor(public userId: string, public projectIri: string) {}
}

export class LoadProjectMembersAction {
    static readonly type = '[Projects] Load Project Members Action';
    constructor(public projectUuid: string) {}
}

export class LoadProjectGroupsAction {
    static readonly type = '[Projects] Load Project Groups Action';
    constructor(public projectUuid: string) {}
}