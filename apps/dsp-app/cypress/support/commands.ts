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
  type: PropertyType;
  name: string;
  label: string;
  comment: string;
}

enum PropertyType {
  SimpleText = 'SimpleText',
  Textarea = 'Textarea',
  Richtext = 'Richtext',
}
