import { browser } from 'k6/browser';
import { defaultOptions } from '../options/options.js';
import { HomePage } from '../pages/home-page.js';
import { OntologyEditorPage } from '../pages/ontology-editor-page.js';
import { LOGIN_DATA, BEOL } from '../options/constants.js';
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';

//export const options = defaultOptions;
export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
  },
};

export default async function () {
  const page = await browser.newPage();
  const homePage = new HomePage(page);
  try {
    console.log('loading home page');
    await homePage.goto();
    await homePage.login();
    console.log('logged in');
    await homePage.openUserMenu();
    console.log('Opened user menu');
    expect(await homePage.loggedInUser.textContent()).to.equal(LOGIN_DATA.fullname);
    console.log('Checked logged in user');
  } finally {
    await page.screenshot({ path: 'screenshots/project-overview-page.png' });
    await page.close();
  }
}
