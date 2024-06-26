// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'n5b5id',
  e2e: {
    specPattern: 'cypress/**/**/**/*.cy.ts',
    excludeSpecPattern: ['*.spec.js', '*.spec.ts'],
    viewportHeight: 768,
    viewportWidth: 1024,
    supportFile: 'cypress/support/e2e.ts',
    baseUrl: 'http://localhost:4200',
    experimentalStudio: true,
    env: {
      apiUrl: 'http://0.0.0.0:3333',
    },
  },
});
