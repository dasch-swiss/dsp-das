import { UserProfiles } from '../models/user-profiles';
import './commands/data-model-class-command';
import './commands/login';
import './commands/ontology-command';
import './commands/resource-commands';

const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
Cypress.on('uncaught:exception', err => {
  /* returning false here prevents Cypress from failing the test */
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
});

// do things here before each test if needed
// All active session data (cookies, localStorage and sessionStorage) across all domains are cleared.
beforeEach(() => {
  let users: UserProfiles;

  // clear database
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/admin/store/ResetTriplestoreContent`,
  });

  cy.readFile('cypress/fixtures/user_profiles.json').then((json: UserProfiles) => {
    // read JSON data file
    users = json;

    if (Cypress.spec.relative.startsWith('cypress/e2e/system-admin')) {
      cy.login({
        username: users.systemAdmin_username_root,
        password: users.systemAdmin_password_root,
      });
    }

    if (Cypress.spec.relative.startsWith('cypress/e2e/project-member')) {
      cy.login({
        username: users.projectMember_username,
        password: users.projectMember_password,
      });
    }
  });
});

// do things here after each test if needed
// afterEach(() => {
// });
