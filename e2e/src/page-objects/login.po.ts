import { browser, by, element } from 'protractor';

export class LoginPage {

    navigateTo() {
        return browser.get('/login');
    }

    getPageTitle() {
        return element(by.css('app-login h2')).getText();
    }
}
