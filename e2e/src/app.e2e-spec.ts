import { AppPage } from './page-objects/app.po';
import { browser, element, by } from 'protractor';

fdescribe('logged out dashboard', () => {
    let page: AppPage;

    beforeEach(() => {
        page = new AppPage();
    });

    fit('should display welcome title', () => {
        page.navigateTo();
        const title = browser.driver.findElement(by.css('app-main h1'));
        expect(title.getText()).toEqual('BRING ALL TOGETHER AND SIMPLIFY YOUR RESEARCH');
    });

    it('should display help button', () => {
        expect(page.getHelpButton().getText()).toEqual('Help');
    });

    it('should route to help page', () => {
        page.getHelpButton().click();
        expect(page.getHelpPageTitle()).toEqual('Need help?');
    });

    it('should display login button', () => {
        expect(page.getLoginButton().getText()).toEqual('LOGIN');
    });

    it('should route to login page', () => {
        page.getLoginButton().click();
        expect(page.getLoginPageTitle()).toEqual('Login here');
    });

    it('should display accept button in the cookie banner', () => {
        expect(page.getAcceptCookieButton().getText()).toEqual('ACCEPT');
    });

    it('should go back to home page', () => {
        page.getAcceptCookieButton().click();
        expect(page.getSubtitle()).toContain('a software framework for storing');
    });

    it('should display dasch logo', () => {
        expect(page.getUnibasLogo().getAttribute('class')).toEqual('logo logo-unibas');
    });

    it('should route to the dasch website and check the URL', () => {
        browser.getWindowHandle().then(function (parentGUID) {
            // click the link that opens in a new window
            element(by.css('img[src="/assets/images/logo-unibas.jpg"]')).click();
            browser.sleep(5000);
            // get the all the session ids of the opened tabs
            browser.getAllWindowHandles().then(function (allGUID) {
                // console.log('Number of tabs opened: ' + allGUID.length);
                // iterate through the tabs
                for (const guid of allGUID) {
                    // find the new browser tab
                    if (guid !== parentGUID) {
                        // switch to the tab
                        browser.switchTo().window(guid);
                        // break the loop
                        break;
                    }
                }
                // perform here any actions needed on the new tab
                expect(browser.driver.getCurrentUrl()).toMatch('https://www.unibas.ch/de');

                // close the new tab
                browser.close();

                // switch back to the parent tab
                browser.switchTo().window(parentGUID);
            });
        });
    });

    it('should display 5 dasch public projects', () => {
        expect(page.getProjects().count()).toEqual(5);
    });

    it('should get the name of the second project of the list (which is BEOL project)', () => {
        expect(page.getBEOLProjectTitle().getText()).toEqual('Bernoulli-Euler Online');
    });

    it('should route to the beol page', () => {
        page.getReadMoreBtnOfBEOL().click();
        expect(page.getBEOLProjectPageTitle()).toEqual('Bernoulli-Euler Online');
    });

});
