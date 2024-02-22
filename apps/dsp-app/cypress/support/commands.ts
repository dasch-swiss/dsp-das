/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    createOntology(projectUuid: string, input?: Ontology): Chainable<Ontology>;
    createDataModelClass(projectUuid: string, input?: DataModelClass): Chainable<DataModelClass>;
  }
}
