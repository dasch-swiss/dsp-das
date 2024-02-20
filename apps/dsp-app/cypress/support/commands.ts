/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    createOntology(projectUuid: string, input?: Ontology): Chainable<Ontology>;
    createDataModelClass(projectUuid: string, input?: DataModelClass): Chainable<DataModelClass>;
  }
}

interface Ontology {
  name: string;
  label: string;
  comment: string;
}

interface DataModelClass {
  name: string;
  label: string;
  comment: string;
}

interface DataModelClassProperty {
  type: string;
  name: string;
  label: string;
  comment: string;
}
