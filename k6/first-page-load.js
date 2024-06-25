import { browser } from 'k6/experimental/browser';
import { check } from 'k6';
import { Homepage } from './pages/homepage.js';

export const options = {
  cloud: {
    distribution: {
      distributionLabel1: { loadZone: 'amazon:de:frankfurt', percent: 100 },
    },
  },
  scenarios: {
    smokeTest: {
      // a small test that checks for major issues before spending more time and resources
      executor: 'shared-iterations',
      vus: 1,
      iterations: 5,
      maxDuration: '10s',

      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
    averageLoad: {
      startTime: '10s',
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 9 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '0s',
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
  const homepage = new Homepage(page);

  try {
    await homepage.goto();
    page.screenshot({ path: 'screenshots/screenshot.png' });
    check(homepage, {
      title: p => p.title.textContent() == 'Projects Overview',
    });
  } finally {
    page.close();
  }
}
