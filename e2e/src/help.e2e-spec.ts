import { HelpPage } from './help.po';
import { browser, element, by } from 'protractor';

describe('help page', () => {
    let page: HelpPage;

    beforeEach(() => {
        page = new HelpPage();
        page.navigateTo();
    });

    it('should display page title', () => {
        expect(page.getPageTitle()).toEqual('Need help?');
    });

    it('should route to project management documentation', () => {
        browser.getWindowHandle().then(function (parentGUID) {
            // click the link that opens in a new window
            page.getProjManagementDocButton().click();
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
                expect(browser.driver.getCurrentUrl()).toMatch('https://docs.dasch.swiss/user-guide/project/');

                // close the new tab
                browser.close();

                // switch back to the parent tab
                browser.switchTo().window(parentGUID);
            });
        });
    });

    // TODO: route to knora-app release note page, knora release note page, sipi release note page, dasch forum page, github page, dasch swiss website page

});
