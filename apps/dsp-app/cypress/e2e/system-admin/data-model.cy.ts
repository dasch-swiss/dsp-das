import { faker } from '@faker-js/faker';
import ProjectPage from '../../support/pages/project-page';

describe('Data Model', () => {
  const projectPage = new ProjectPage();

  beforeEach(() => {
    projectPage.requestProject();
  });

  it('should create new data model', () => {
    const data = {
      name: faker.string.alpha({ length: { min: 3, max: 16 } }),
      label: faker.lorem.text(),
      comment: faker.lorem.sentence(),
    };

    cy.intercept('POST', '/v2/ontologies').as('submitRequest');
    cy.visit(`/project/${projectPage.projectUuid}/data-models`);
    cy.url().should('include', `project\/${projectPage.projectUuid}\/data-models`);

    cy.get('[data-cy=data-models-container]')
      .find('[data-cy=create-button]')
      .scrollIntoView()
      .should('be.visible')
      .click();

    cy.get('[data-cy=name-input]').type(data.name);
    cy.get('[data-cy=label-input]').clear().type(data.label);
    cy.get('[data-cy=comment-textarea]').type(data.comment);
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@submitRequest');
    cy.url().should('match', new RegExp(`project/${projectPage.projectUuid}/ontology/${data.name}/editor/classes`));
    cy.get('[data-cy=ontology-label]').contains(data.label).should('be.visible');
  });

  it('should update data model', () => {
    const data = <Ontology>{
      name: faker.string.alpha({ length: { min: 3, max: 16 } }),
      label: faker.lorem.text(),
      comment: faker.lorem.sentence(),
    };

    cy.intercept('PUT', '/v2/ontologies/metadata').as('updateRequest');

    cy.createOntology(projectPage.projectUuid).then(ontology => {
      cy.get('[data-cy=edit-ontology-button]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy=label-input]').clear().type(data.label).wait(400);
      cy.get('[data-cy=comment-textarea]').type(data.comment).wait(400);
      cy.get('[data-cy=submit-button]').click();

      cy.wait('@updateRequest').wait(6000);
      cy.url().should('include', `project/${projectPage.projectUuid}/ontology/${ontology.name}/editor/classes`);
      cy.get('[data-cy=ontology-label]').contains(data.label).should('be.visible');
    });
  });
});
