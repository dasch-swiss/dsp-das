export class Homepage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('html > head > title');
  }

  async goto() {
    await this.page.goto('https://app.dev.dasch.swiss');
  }
}
