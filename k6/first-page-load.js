import { browser } from 'k6/experimental/browser';

export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
};

export default async function () {
  const page = browser.newPage();

  try {
    await page.goto('https://app.dev.dasch.swiss/');
    page.screenshot({ path: 'screenshots/screenshot.png' });

    check(page, {
      title: p => p.locator('/html[1]/head[1]/title[1]').textContent() == 'Projects overview',
    });
  } finally {
    page.close();
  }
}
