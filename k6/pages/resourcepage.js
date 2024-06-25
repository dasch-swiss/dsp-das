export class Resourcepage {
  constructor(page) {
    this.page = page;
    this.rsourcelabel = page.locator('.resource-header > .resource-label > h4');
  }
  async goto() {
    await this.page.goto('https://app.dev.dasch.swiss/project/yTerZGyxjZVqFMNNKXCDPF/ontology/beol/basicLetter');
  }
}
