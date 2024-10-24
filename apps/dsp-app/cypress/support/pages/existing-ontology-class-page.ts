export class ProjectAssertionPageBase {
  projectShortCode: string;
  ontologyName: string;

  constructor(projectShortCode: string, ontologyName: string) {
    this.projectShortCode = projectShortCode;
    this.ontologyName = ontologyName;
  }

  visitClass = (ontoClassName: string) => {
    cy.visit(`/project/${this.projectShortCode}/ontology/${this.ontologyName}/${ontoClassName}`);
  };
}
export class Project0803Page extends ProjectAssertionPageBase {
  static readonly projectShortCode = '0803';
  static readonly ontologyName = 'incunabula';

  constructor() {
    super(Project0803Page.projectShortCode, Project0803Page.ontologyName);
  }
}

export class Project0001Page extends ProjectAssertionPageBase {
  static readonly projectShortCode = '0001';
  static readonly defaultOntology = 'anything';

  constructor() {
    super(Project0001Page.projectShortCode, Project0001Page.defaultOntology);
  }
}

export class Project00FFPage extends ProjectAssertionPageBase {
  static readonly projectShortCode = '00FF';
  static readonly defaultOntology = 'images';

  constructor() {
    super(Project00FFPage.projectShortCode, Project00FFPage.defaultOntology);
  }
}
