export class ExistingOntologyClassPage {
  existingProjectShortCode = '0803';
  existingOntologyName = 'incunabula';

  visitClass = (ontoClassName: string) => {
    cy.visit(`/project/${this.existingProjectShortCode}/ontology/${this.existingOntologyName}/${ontoClassName}`);
  };
}
