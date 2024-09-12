import { LOGIN_DATA } from '../options/constants.js';

export class HomePage {
  constructor(page) {
    this.page = page;
    this.loginButton = this.page.locator('[data-cy=login-button]');
    this.usernameInput = this.page.locator('#mat-input-1');
    this.passwordInput = this.page.locator('#mat-input-0');
    this.submitButton = this.page.locator('button.mdc-button--raised:nth-child(3)');
    this.userMenu = this.page.locator('.user-menu');
    this.signedIn = this.page.locator('div.menu-title:nth-child(1)');
    this.loggedInUser = this.page.locator('div.menu-title:nth-child(2)');
  }

  async goto() {
    await this.page.goto(__ENV.APP_URL);
  }

  async title() {
    return await this.page.title();
  }

  async login() {
    await this.loginButton.click();
    await this.usernameInput.fill(LOGIN_DATA.username);
    await this.passwordInput.fill(LOGIN_DATA.password);
    await this.submitButton.click();
    Promise.all([this.page.waitForNavigation(), this.page.waitForSelector('img.avatar')]);
  }

  async openUserMenu() {
    this.userMenu.click();
  }
}
