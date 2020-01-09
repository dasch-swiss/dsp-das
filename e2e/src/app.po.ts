import { browser, by, element } from 'protractor';
import { dashCaseToCamelCase } from '@angular/compiler/src/util';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getMainTitle() {
    return element(by.css('app-main h1')).getText();
  }

  getSubtitle() {
    return element(by.css('app-main h2')).getText();
  }

  getHelpButton() {
    return element(by.buttonText('Help'));
  }

  getHelpPageTitle() {
    return element(by.css('app-help h1')).getText();
  }

  getLoginButton() {
    return element(by.buttonText('LOGIN'));
  }

  getLoginPageTitle() {
    return element(by.css('app-login h2')).getText();
  }

  getAcceptCookieButton() {
    return element(by.buttonText('ACCEPT'));
  }

  getUnibasLogo() {
    return element(by.css('img[src="/assets/images/logo-unibas.jpg"]'));
  }

  getUnibasWebsite() {
    return element(by.css('img[title="Universität Basel"]')).getText();
  }

}
