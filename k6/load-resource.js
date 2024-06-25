import { browser } from 'k6/experimental/browser';
import { check } from 'k6';
import { Resourcepage } from './pages/resourcepage.js';

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
      tags: { type: 'smoke-test' },
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
      tags: { type: 'average-load' },
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
  const homepage = new Resourcepage(page);

  try {
    await homepage.goto();
    page.screenshot({ path: 'screenshots/resource-page.png' });
    check(homepage, {
      resourcelabel: p => p.rsourcelabel.textContent() == '1723-02-06_Scheuchzer_Johann_Jakob-Bernoulli_Johann_I',
    });
  } finally {
    page.close();
  }
}
