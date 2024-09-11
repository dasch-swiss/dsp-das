export class ProjectOverviewPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(__ENV.APP_URL + '/project/yTerZGyxjZVqFMNNKXCDPF');
  }

  async projectLongname() {
    return await this.page.locator('.project-longname').textContent();
  }
}
