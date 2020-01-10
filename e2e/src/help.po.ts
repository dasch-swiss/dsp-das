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

    // TODO: grab the version number
    getKnoraAppReleaseNotesButton() {
        const appGridProductEl = element.all(by.css('#app-grid-tools .app-grid-item'));
        const knoraAppEl = appGridProductEl.get(0);

        return knoraAppEl.element(by.css('.action .mat-button'));
    }

    getDaschForumButton() {
        const appGridProductEl = element.all(by.css('#app-grid-tools .app-grid-item'));
        const knoraAppEl = appGridProductEl.get(3);

        return knoraAppEl.element(by.css('.action .mat-button'));
    }

    getDaschSwissButton() {
        const appGridProductEl = element.all(by.css('#app-grid-tools .app-grid-item'));
        const knoraAppEl = appGridProductEl.get(4);

        return knoraAppEl.element(by.css('.action .mat-button'));
    }

    getGithubContributeButton() {
        const appGridProductEl = element.all(by.css('#app-grid-tools .app-grid-item'));
        const knoraAppEl = appGridProductEl.get(5);

        return knoraAppEl.element(by.css('.action .mat-button'));
    }

}
