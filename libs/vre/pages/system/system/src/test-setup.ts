// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: false,
    errorOnUnknownProperties: false,
  },
};
import 'jest-preset-angular/setup-jest';
