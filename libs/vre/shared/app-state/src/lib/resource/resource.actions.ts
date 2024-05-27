export class GetAttachedUserAction {
  static readonly type = '[Resource] Get Attached User';

  constructor(
    public resourceIri: string,
    public identifier: string,
    public idType: 'iri' | 'username' | 'email' = 'iri'
  ) {}
}

export class GetAttachedProjectAction {
  static readonly type = '[Resource] Get Attached Project';

  constructor(
    public resourceIri: string,
    public projectIri: string
  ) {}
}

export class LoadResourceAction {
  static readonly type = '[Resource] Load resource';

  constructor(public resourceIri: string) {}
}

export class LoadAnnotatedResourceAction {
  static readonly type = '[Resource] Load annotated resource';

  constructor(public regionIri: string) {}
}
