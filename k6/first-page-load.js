import { browser } from 'k6/experimental/browser';
import { check } from 'k6';
import { Homepage } from './pages/homepage.js';
import { defaultOptions } from './options/options.js';

export const options = defaultOptions;

export default async function () {
  const page = browser.newPage();
  const homepage = new Homepage(page);

  try {
    await homepage.goto();
    page.screenshot({ path: 'screenshots/homepage.png' });
    check(homepage, {
      title: p => p.title.textContent() == 'Projects Overview',
    });
  } finally {
    page.close();
  }
}
