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
      dspIngestUrl: 'http://0.0.0.0:3340',
      sipiIIIfUrl: 'http://0.0.0.0:1024',
    },
    trashAssetsBeforeRuns: true,
    screenshotsFolder: 'cypress/fixtures/screenshots',
    reporter: 'spec',
    reporterOptions: {
      mochaFile: 'cypress/test-output.xml',
      toConsole: true,
    },
    video: true,

    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          // fullPage screenshot size is 1600x1400 on non-retina screens
          // and 2800x2400 on retina screens
          launchOptions.args.push('--window-size=1600,1400');
          // force screen to be non-retina (1600x1400 size)
          launchOptions.args.push('--force-device-scale-factor=1');
          // force screen to be retina (2800x2400 size)
          // launchOptions.args.push('--force-device-scale-factor=2')
        }

        if (browser.name === 'electron' && browser.isHeadless) {
          // fullPage screenshot size is 1400x1200
          launchOptions.preferences.width = 1400;
          launchOptions.preferences.height = 1200;
        }

        if (browser.name === 'firefox' && browser.isHeadless) {
          // menubars take up height on the screen
          // so fullPage screenshot size is 1400x1126
          launchOptions.args.push('--width=1400');
          launchOptions.args.push('--height=1200');
        }

        return launchOptions;
      });
    },
  },
});
