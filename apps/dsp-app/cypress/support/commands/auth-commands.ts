import { User, UserProfiles } from '../../models/user-profiles';

Cypress.Commands.add('resetDatabase', () =>
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/admin/store/ResetTriplestoreContent`,
    body: [
      {
        path: 'test_data/project_data/anything-data.ttl',
        name: 'http://www.knora.org/ontology/0001/anything',
      },
    ],
  })
);

Cypress.Commands.add('login', (user: User) =>
  cy
    .request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/v2/authentication`,
      body: {
        username: user.username,
        password: user.password,
      },
    })
    .then(response => {
      localStorage.setItem('cookieBanner', 'false');
      localStorage.setItem('rnw-closed-banners', 'true');
      localStorage.setItem('ACCESS_TOKEN', response.body.token);
    })
);

Cypress.Commands.add('logout', () => {
  cy.session(
    {},
    () => {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl')}/v2/authentication`,
      }).then(response => {
        localStorage.removeItem('cookieBanner');
        localStorage.removeItem('rnw-closed-banners');
        localStorage.removeItem('ACCESS_TOKEN');
      });
    },
    {
      validate: () => {
        expect(localStorage.getItem('ACCESS_TOKEN')).to.not.exist;
      },
    }
  );
});

Cypress.Commands.add('loginAdmin', () => {
  // Use environment variables if available (for remote environments)
  const envUsername = Cypress.env('DSP_APP_USERNAME');
  const envPassword = Cypress.env('DSP_APP_PASSWORD');
  
  if (envUsername && envPassword) {
    cy.login({
      username: envUsername,
      password: envPassword,
    });
  } else {
    // Fallback to user_profiles.json for local testing
    cy.readFile('cypress/fixtures/user_profiles.json').then((users: UserProfiles) =>
      cy.login({
        username: users.systemAdmin_username_root,
        password: users.systemAdmin_password_root,
      })
    );
  }
});
