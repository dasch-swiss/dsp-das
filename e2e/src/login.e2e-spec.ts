import { LoginPage } from './page-objects/login.po';
import { browser, by } from 'protractor';

describe('login page', () => {
    let page: LoginPage;

    function performLogin() {
        const loginBtn = page.getLoginButton();
        loginBtn.click();
        browser.waitForAngular();
    }

    function performLogout() {
        const userMenuBtn = browser.findElement(by.css('app-user-menu button'));
        userMenuBtn.click();

        browser.executeScript(`
            const button = document.querySelector('.menu-action.logout');
            button.click();`
        );
    }

    beforeEach(() => {
        page = new LoginPage();
    });

    it('should display page title', () => {
        page.navigateToLogin();
        expect(page.getPageTitle()).toEqual('Login here');
    });

    it('should log in', () => {

        page.navigateToLogin();

        const username = page.getUsername();
        const password = page.getPassword();

        // fill input fields
        username.sendKeys('root');
        password.sendKeys('test');

        // check fields contain the entered value
        expect(username.getAttribute('value')).toEqual('root');
        expect(password.getAttribute('value')).toEqual('test');

        // log in
        performLogin();

        // check the user has been redirected to the dashboard
        expect(browser.driver.getCurrentUrl()).toMatch('/dashboard');
        expect(page.getDashboardTitle()).toContain('Welcome');

        // check the session
        const value = browser.executeScript("return window.localStorage.getItem('session');");
        expect(value).toBeTruthy();
        expect(value).toContain('"name":"root"');

    });

    it('should log out', () => {
        // log out
        performLogout();

        expect(page.getPageTitle()).toEqual('Login here');
        expect(browser.getCurrentUrl()).toContain('/login?returnUrl=%2Fdashboard');

        // check the session
        const value = browser.executeScript("return window.localStorage.getItem('session');");
        expect(value).toBe(null);
    });

});
