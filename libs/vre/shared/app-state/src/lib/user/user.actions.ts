import { ReadUser, User } from "@dasch-swiss/dsp-js";

export class LoadUserAction {
    static readonly type = '[User] Load User';
    constructor(public username: string) {}
}

export class SetUserAction {
    static readonly type = '[User] Set User';
    constructor(public user: ReadUser) {}
}

export class RemoveUserAction {
    static readonly type = '[User] Remove User';
    constructor(public user: ReadUser) {}
}

export class LogUserOutAction {
    static readonly type = '[User] Log user out';
    constructor() {}
}

export class SetUserProjectGroupsAction {
    static readonly type = '[User] Set User Project Groups';
    constructor(public user: ReadUser) {}
}

export class LoadUsersAction {
    static readonly type = '[User] Load All Users';
    constructor() {}
}

export class ResetUsersAction {
    static readonly type = '[User] Reset All Users';
    constructor() {}
}

export class CreateUserAction {
    static readonly type = '[User] Create User';
    constructor(public userData: User) {}
}

