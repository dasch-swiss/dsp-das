import { ReadOntology } from '@dasch-swiss/dsp-js';

export class LoadProjectOntologiesAction {
  static readonly type = '[Ontologies] Load Project Ontologies';

  constructor(
    public projectIri: string,
    public ontologyName?: string
  ) {}
}

export class SetOntologyAction {
  static readonly type = '[Ontologies] Set Ontology';

  constructor(
    public ontology: ReadOntology,
    public projectIri: string
  ) {}
}

export class LoadOntologyAction {
  static readonly type = '[Ontologies] Load Ontology';

  constructor(
    public ontologyIri: string,
    public projectUuid: string,
    public stopLoadingWhenCompleted = true
  ) {}
}

export class ResetCurrentOntologyAction {
  static readonly type = '[Ontologies] Update current ontology if needed';

  constructor(
    public ontology: ReadOntology,
    public projectIri: string
  ) {}
}

export class ClearOntologiesAction {
  static readonly type = '[Ontologies] Clear Ontologies';
}

export class SetCurrentOntologyAction {
  static readonly type = '[Ontologies] Set Current Ontology';

  constructor(public readOntology: ReadOntology) {}
}

export class RemoveProjectOntologyAction {
  static readonly type = '[Ontologies] Remove Project Ontology';

  constructor(
    public readOntologyId: string,
    public projectUuid: string
  ) {}
}
