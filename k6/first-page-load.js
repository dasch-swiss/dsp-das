import { browser } from 'k6/experimental/browser';
import { check } from 'k6';
import { HomePage } from './pages/homepage.js';

export const options = {
  vus: 10,
  cloud: {
    distribution: {
      distributionLabel1: { loadZone: 'amazon:de:frankfurt', percent: 100 },
    },
  },
  scenarios: {
    browser: {
      executor: 'shared-iterations',

      // executor-specific configuration
      vus: 1,
      iterations: 200,
      maxDuration: '5s',
      tags: { example_tag: 'testing' },

      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
};

export default async function () {
  const page = browser.newPage();

  try {
    await page.goto('https://app.dev.dasch.swiss/');
    page.screenshot({ path: 'screenshots/screenshot.png' });
    check(page, {
      title: p => p.locator('html>head>title').textContent() == 'Projects Overview',
    });
  } finally {
    page.close();
  }
}
