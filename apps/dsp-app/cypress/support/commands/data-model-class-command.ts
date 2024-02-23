import { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { CreateResourceClassPayload } from '@dasch-swiss/dsp-js/src/models/v2/ontologies/create/create-resource-class';
import { faker } from '@faker-js/faker';
import { JsonConvert } from 'json2typescript';
import ProjectPage from '../pages/project-page';

Cypress.Commands.add(
  'createDataModelClass',
  (
    projectPage: ProjectPage,
    resourceClass = {
      id: faker.lorem.word(),
      name: faker.lorem.word(),
      type: '',
      subClassOf: [],
      comment: [{ value: faker.lorem.word() }],
      label: [{ value: faker.lorem.word() }],
    }
  ) => {
    cy.createOntology(projectPage).then(ontology => {
      resourceClass.id = ontology.ontologyMetadata['@id'];
      const request = new JsonConvert().serializeObject(resourceClass, CreateResourceClassPayload);
      cy.request<ResourceClassDefinitionWithAllLanguages>(
        'POST',
        `${Cypress.env('apiUrl')}/v2/ontologies/classes`,
        request
      ).then(response => {
        cy.log('Data model class created!');
      });
    });

    return cy.wrap(resourceClass).as('dataModelClass');
  }
);
