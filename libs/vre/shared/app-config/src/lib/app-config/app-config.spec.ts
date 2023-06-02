/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AppConfig, Datadog, Rollbar } from './app-config';
import { ZodError } from 'zod';

describe('app-config schema tests', () => {
    const devConfig: AppConfig = {
        dspRelease: '2022.01.01',
        apiProtocol: 'http',
        apiHost: '0.0.0.0',
        apiPort: 3333,
        apiPath: 'mypath',
        iiifProtocol: 'http',
        iiifHost: '0.0.0.0',
        iiifPort: 1024,
        iiifPath: 'mypath',
        jsonWebToken: 'mytoken',
        logErrors: true,
        zioPrefix: ':5555',
        zioEndpoints: ['/admin/projects'],
        geonameToken: 'geoname_token',
        iriBase: 'http://rdfh.ch',
        instrumentation: {
            environment: 'dev',
            dataDog: {
                enabled: true,
                applicationId: 'app_id',
                clientToken: 'client_token',
                site: 'site',
                service: 'dsp-app',
            },
            rollbar: {
                enabled: true,
                accessToken: 'rollbar_token',
            },
        },
    };

    const instrumentationConfig: any = {
        environment: 'dev',
        dataDog: {
            enabled: false,
            applicationId: 'app_id',
            clientToken: 'client_token',
            site: 'site',
            service: 'dsp-app',
        },
        rollbar: {
            enabled: false,
            accessToken: 'rollbar_token',
        },
    };

    test('should throw error for invalid datadog config', () => {
        expect(() => {
            const data = {
                enabled: true,
            };
            Datadog.parse(data);
        }).toThrow(ZodError);
    });

    test('should not throw error for valid Datadog config (1)', () => {
        expect(() => {
            const data = {
                enabled: false,
                applicationId: '1234',
                clientToken: '1234',
                site: '1234',
                service: '1234',
            };
            Datadog.parse(data);
        }).toBeTruthy();
    });

    test('should not throw error for valid Datadog config (2)', () => {
        expect(() => {
            const data = {
                enabled: false,
            };
            Datadog.parse(data);
        }).toBeTruthy();
    });

    test('should throw error for invalid Rollbar config (1)', () => {
        expect(() => {
            const data = {
                enabled: true,
            };
            Datadog.parse(data);
        }).toThrowError(ZodError);
    });

    test('should throw error for invalid Rollbar config (2)', () => {
        expect(() => {
            const data = {
                enabled: true,
                accessToken: '',
            };
            Rollbar.parse(data);
        }).toThrowError(ZodError);
    });

    test('should not throw error for valid Rollbar config (1)', () => {
        expect(() => {
            const data = {
                enabled: false,
            };
            Rollbar.parse(data);
        }).toBeTruthy();
    });

    test('should not throw error for valid Rollbar config (2)', () => {
        expect(() => {
            const data = {
                enabled: false,
                accessToken: '1234567890',
            };
            Rollbar.parse(data);
        }).toBeTruthy();
    });
});
