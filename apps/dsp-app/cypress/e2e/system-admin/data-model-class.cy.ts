import { faker } from '@faker-js/faker';
import ProjectPage from '../../support/pages/project-page';

describe('Data Model Class', () => {
  const projectPage = new ProjectPage();

  beforeEach(() => {
    projectPage.requestProject();
  });

  it('should create new data model class', () => {
    const data = <DataModelClass>{
      name: faker.string.alpha({ length: { min: 3, max: 16 } }),
      label: faker.lorem.text(),
      comment: faker.lorem.sentence(),
    };

    cy.intercept('POST', '/v2/ontologies/classes').as('createRequest');

    cy.createOntology(projectPage.projectUuid);

    cy.get('[data-cy=create-class-button]').scrollIntoView().should('be.visible').click();
    cy.get('[data-cy=TextRepresentation]').scrollIntoView().should('be.visible').click({ force: true });
    cy.get('[data-cy=name-input]').clear().type(data.name);
    cy.get('[data-cy=label-input]').clear().type(data.label);
    cy.get('[data-cy=comment-textarea]').type(data.comment);
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@createRequest');
    cy.get('[data-cy=class-card]').should('be.visible').get('mat-card-title').contains(data.label.split(' ')[0]);
  });

  it.only('should add properties to a data model class', () => {
    const property = <DataModelClassProperty>{
      type: 'SimpleText',
      name: faker.string.alpha({ length: { min: 3, max: 16 } }),
      label: faker.lorem.text(),
      comment: faker.lorem.sentence(),
    };

    cy.intercept('POST', '/v2/ontologies/classes').as('createRequest');

    cy.createDataModelClass(projectPage.projectUuid).then(dataModelClass => {
      cy.get('[data-cy=properties-button]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy=create-property-button]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy=TextRepresentation]').scrollIntoView().should('be.visible').click({ force: true });
      cy.get('[data-cy=name-input]').clear().type(property.name);
      cy.get('[data-cy=label-input]').clear().type(property.label);
      cy.get('[data-cy=comment-textarea]').type(property.comment);
      cy.get('[data-cy=submit-button]').click();
      cy.wait('@createRequest');
    });
  });
});
