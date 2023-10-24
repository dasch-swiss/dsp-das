
export class ClearListsAction {
    static readonly type = '[Lists] Clear lists';
    constructor() {}
}

export class GetListsInProjectAction {
    static readonly type = '[Lists] Get Lists In Project';
    constructor(public projectId: string) {}
}