export class LoadProjectOntologiesAction {
    static readonly type = '[Ontologies] Load Project Ontologies';
    constructor(public projectUuid: string) {}
}

export class LoadOntologyAction {
    static readonly type = '[Ontologies] Load Ontology';
    constructor(
        public ontologyId: string, 
        public projectUuid: string, 
        public stopLoadingWhenCompleted: boolean = true
    ) {}
}

export class ClearProjectOntologiesAction {
    static readonly type = '[Ontologies] Clear Project Ontologies';
    constructor(public projectUuid: string) {}
}