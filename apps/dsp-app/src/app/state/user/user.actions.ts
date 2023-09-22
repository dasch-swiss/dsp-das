import { ReadUser, User } from "@dasch-swiss/dsp-js";

export class LoadUserAction {
    static readonly type = '[User] Load User';
    constructor(public username: string) {}
}

export class SetUserAction {
    static readonly type = '[User] Set User';
    constructor(public user: User) {}
}

export class LogUserOutAction {
    static readonly type = '[User] Log user out';
    constructor() {}
}