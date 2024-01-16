export class LoadClassItemsCountAction {
  static readonly type = '[OntologyClass] Load Class Item Count';
  constructor(
    public ontologyIri: string,
    public resClassId: string
  ) {}
}
