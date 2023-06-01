/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AppConfig } from './app-config';
import { Datadog } from './app-config';
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

    test('should error for invalid datadog config', () => {
        expect(
            Datadog.parse({
                datadog: {
                    enabled: true,
                },
            })
        ).toThrowError(ZodError);

        expect(
            Datadog.parse({
                datadog: {
                    enabled: false,
                },
            })
        ).toBeTruthy();
    });
});
