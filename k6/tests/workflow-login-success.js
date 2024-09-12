import { browser } from 'k6/browser';
import { defaultOptions } from '../options/options.js';
import { HomePage } from '../pages/home-page.js';
import { LOGIN_DATA } from '../options/constants.js';
import { expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';

export const options = defaultOptions;

export default async function () {
  const page = await browser.newPage();
  const homePage = new HomePage(page);
  try {
    console.log('Loading home page');
    await homePage.goto();
    await homePage.login();
    console.log('Logged in');
    await homePage.openUserMenu();
    console.log('Opened user menu');
    expect(await homePage.loggedInUser.isVisible()).to.be.true;
    console.log('Checked logged in user');
  } finally {
    await page.screenshot({ path: 'screenshots/workflow-login-success-page.png' });
    await page.close();
  }
}
