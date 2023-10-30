
export class ClearListsAction {
    static readonly type = '[Lists] Clear lists';
    constructor() {}
}

export class LoadListsInProjectAction {
    static readonly type = '[Lists] Load Lists In Project';
    constructor(public projectIri: string) {}
}