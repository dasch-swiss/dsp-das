import { browser } from 'k6/experimental/browser';
import { check } from 'k6';
import { Resourcepage } from '../pages/resourcepage.js';
import { defaultOptions } from '../options/options.js';

export const options = defaultOptions;

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
