import { browser, by, element } from 'protractor';

export class HelpPage {
    navigateTo() {
        return browser.get('/help');
    }

    getPageTitle() {
        return element(by.css('app-help h1')).getText();
    }

    getProjManagementDocButton() {
        const appGridDocEl = element.all(by.css('#app-grid-documentation .app-grid-item'));
        const projManagementEl = appGridDocEl.get(0);

        return projManagementEl.element(by.css('.action .mat-button'));
    }

}
