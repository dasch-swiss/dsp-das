export class ExistingOntologyClassPage {
  static readonly existingProjectShortCode = '0803';
  static readonly existingOntologyName = 'incunabula';

  visitClass = (ontoClassName: string) => {
    cy.visit(
      `/project/${ExistingOntologyClassPage.existingProjectShortCode}/ontology/${ExistingOntologyClassPage.existingOntologyName}/${ontoClassName}`
    );
  };
}
