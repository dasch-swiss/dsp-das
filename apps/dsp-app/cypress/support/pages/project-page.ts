import { ProjectADM, ProjectOperationResponseADM } from '../../../../../libs/vre/open-api/src';

class ProjectPage {
  private payload = {
    shortname: 'shortname',
    shortcode: 'A0A0',
    longname: 'Longname',
    description: [{ language: 'de', value: 'description' }],
    keywords: ['keyword'],
    status: true,
    selfjoin: true,
  };

  projectIri: string;
  projectUuid: string;
  project: ProjectADM;

  visit() {
    cy.visit(`/project/${this.projectIri.match(/\/([^\/]+)$/)[1]}`);
  }

  requestProject() {
    cy.request<ProjectOperationResponseADM>('POST', `${Cypress.env('apiUrl')}/admin/projects`, this.payload).then(
      response => {
        this.projectIri = response.body.project.id;
        this.projectUuid = this.projectIri.match(/\/([^\/]+)$/)[1];
        this.project = response.body.project;
        this.visit();
      }
    );
  }
}

export default ProjectPage;
