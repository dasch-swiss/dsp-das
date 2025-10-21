/* eslint-disable */
import { getJestProjectsAsync } from '@nx/jest';

export default async () => ({
    projects: await getJestProjectsAsync(),
    // Combined coverage configuration
    collectCoverage: true,
    coverageDirectory: './coverage',
    coverageReporters: ['html', 'lcov', 'text-summary', 'json'],
});
