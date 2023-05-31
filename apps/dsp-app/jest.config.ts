/* eslint-disable */
export default {
    displayName: 'dsp-app',
    preset: '../../jest.preset.js',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    coverageDirectory: '../../coverage/apps/dsp-app',
    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    // fix: SyntaxError: Unexpected token 'export' of js-lib
    transformIgnorePatterns: ['node_modules/(?!@angular|@dasch-swiss|@ngx-translate|angular-split|ngx-color-picker)'],
    snapshotSerializers: [
        'jest-preset-angular/build/serializers/no-ng-attributes',
        'jest-preset-angular/build/serializers/ng-snapshot',
        'jest-preset-angular/build/serializers/html-comment',
    ],
    testRunner: 'jest-jasmine2',
};
