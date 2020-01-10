import { LoginPage } from './login.po';
import { browser, by } from 'protractor';

describe('login page', () => {
    let page: LoginPage;

    beforeEach(() => {
        page = new LoginPage();
        page.navigateTo();
    });

    it('should display page title', () => {
        expect(page.getPageTitle()).toEqual('Login here');
    });

    it('should log in', () => {
        const username = browser.findElement(by.css('input[formControlName=username]'));
        const password = browser.findElement(by.css('input[formControlName=password]'));
        const loginBtn = browser.findElement(by.css('kui-login-form form button'));

        // fill input fields
        username.sendKeys('root');
        password.sendKeys('test');

        // check fields contain the entered value
        expect(username.getAttribute('value')).toEqual('root');
        expect(password.getAttribute('value')).toEqual('test');

        // submit form to log in
        loginBtn.click().then(function () {
            expect(browser.driver.getCurrentUrl()).toMatch('/dashboard');
        });
    });

});
