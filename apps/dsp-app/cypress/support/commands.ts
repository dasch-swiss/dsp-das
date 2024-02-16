/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    createOntology(input: Ontology, projectUuid: string): Chainable<Element>;
  }
}

interface Ontology {
  name: string;
  label: string;
  comment: string;
}
