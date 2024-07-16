import { browser } from 'k6/browser';
import { check } from 'k6';
import { ResourcePage } from '../pages/resource-page.js';
import { defaultOptions } from '../options/options.js';
import { Counter } from 'k6/metrics';

export const options = defaultOptions;
export const errorCounter = new Counter('errors');

export default async function () {
  const context = await browser.newContext();
  const page = await context.newPage();
  const homepage = new ResourcePage(page);

  try {
    await homepage.goto();

    await page.waitForNavigation();
    const resourceLabel = await page.resourcelabel.textContent();
    const success = check(homepage, {
      resourcelabel: resourcelabel => resourcelabel == '1723-02-06_Scheuchzer_Johann_Jakob-Bernoulli_Johann_I',
    });
    if (!success) {
      errorCounter.add(1);
    }
    await page.screenshot({ path: 'screenshots/resource-page.png' });
  } finally {
    page.close();
  }
}
