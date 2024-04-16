export class AddResourceInstancePage {
  visitAddPage = () => {
    cy.visit('/project/00FF/ontology/images/datamodelclass/add');
  };

  addSubmit = () => {
    cy.get('[data-cy=submit-button]').click();
  };

  setupEdit = () => {
    cy.get('app-base-switch').trigger('mouseenter');
    cy.get('[data-cy=edit-button]').click();
  };

  saveEdit() {
    cy.get('[data-cy=save-button]').click();
  }

  delete() {
    cy.reload(); // TODO shouldnt reload
    cy.get('app-base-switch').trigger('mouseenter');
    cy.get('[data-cy=delete-button]').click();
    cy.get('[data-cy=confirm-button]').click();
    cy.reload(); // TODO shouldnt reload
    cy.contains('This resource has no defined properties');
  }

  addInitialLabel() {
    cy.get('[data-cy=label-input]').type('label');
  }
}
