const nxPreset = require('@nx/jest/preset').default;
const { swcAngularJestTransformer } = require('@jscutlery/swc-angular');

module.exports = {
  ...nxPreset,
  coverageReporters: ['html', 'json', 'text-summary', 'lcov'],
  coverageProvider: 'v8',
  setupFiles: ['reflect-metadata'],
  transform: {
    '^.+\\.(ts|mjs|js)$': swcAngularJestTransformer(),
    '^.+\\.(html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|@dasch-swiss|@ckeditor|lodash-es)',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
