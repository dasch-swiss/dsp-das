/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { TestBed } from '@angular/core/testing';
import { AppConfigService } from './app-config.service';
import { AppConfig } from './app-config';
import { AppConfigToken } from './dsp-api-tokens';

describe('AppConfigService with dev config', () => {
    let service: AppConfigService;

    const devConfig = {
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
                enabled: false,
            },
            rollbar: {
                enabled: false,
            },
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: AppConfigToken,
                    useValue: devConfig,
                },
            ],
        });
        service = TestBed.inject(AppConfigService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should process the fully specified config (dev mode)', async () => {
        expect(service.dspConfig.environment).toEqual('dev');
        expect(service.dspConfig.color).toEqual('accent');
        expect(service.dspConfig.production).toEqual(false);
        expect(service.dspApiConfig.apiProtocol).toEqual('http');
        expect(service.dspApiConfig.apiHost).toEqual('0.0.0.0');
        expect(service.dspApiConfig.apiPort).toEqual(3333);
        expect(service.dspApiConfig.zioPrefix).toEqual(':5555');
        expect(service.dspApiConfig.zioEndpoints).toEqual(['/admin/projects']);
        expect(service.dspApiConfig.apiPath).toEqual('mypath');
        expect(service.dspIiifConfig.iiifProtocol).toEqual('http');
        expect(service.dspIiifConfig.iiifHost).toEqual('0.0.0.0');
        expect(service.dspIiifConfig.iiifPort).toEqual(1024);
        expect(service.dspIiifConfig.iiifPath).toEqual('mypath');
        expect(service.dspApiConfig.jsonWebToken).toEqual('mytoken');
        expect(service.dspApiConfig.logErrors).toEqual(true);
        expect(service.dspAppConfig.geonameToken).toEqual('geoname_token');
        expect(service.dspAppConfig.iriBase).toEqual('http://rdfh.ch');
        expect(service.dspInstrumentationConfig.environment).toEqual('dev');
        expect(service.dspInstrumentationConfig.dataDog.enabled).toEqual(false);
        expect(
            service.dspInstrumentationConfig.dataDog.applicationId
        ).toBeUndefined();
        expect(
            service.dspInstrumentationConfig.dataDog.clientToken
        ).toBeUndefined();
        expect(service.dspInstrumentationConfig.dataDog.site).toBeUndefined();
        expect(
            service.dspInstrumentationConfig.dataDog.service
        ).toBeUndefined();
        expect(service.dspInstrumentationConfig.rollbar.enabled).toEqual(false);
        expect(
            service.dspInstrumentationConfig.rollbar.accessToken
        ).toBeUndefined();
    });
});

describe('AppConfigService with prod config', () => {
    let service: AppConfigService;

    const prodConfig: AppConfig = {
        dspRelease: '2023.04.02',
        apiProtocol: 'https',
        apiHost: '0.0.0.0',
        apiPort: 3333,
        apiPath: '',
        iiifProtocol: 'https',
        iiifHost: '0.0.0.0',
        iiifPort: 1024,
        iiifPath: '',
        jsonWebToken: 'mytoken',
        logErrors: true,
        zioPrefix: '/zio',
        zioEndpoints: [],
        geonameToken: 'geoname_token',
        iriBase: 'http://rdfh.ch',
        instrumentation: {
            environment: 'production',
            dataDog: {
                enabled: true,
                applicationId: 'app_id',
                clientToken: 'client_token',
                site: 'datadoghq.eu',
                service: 'dsp-app',
            },
            rollbar: {
                enabled: true,
                accessToken: 'rollbar_token',
            },
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: AppConfigToken,
                    useValue: prodConfig,
                },
            ],
        });
        service = TestBed.inject(AppConfigService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should process the fully specified config (prod mode)', async () => {
        expect(service.dspConfig.release).toEqual('2023.04.02');
        expect(service.dspConfig.environment).toEqual('production');
        expect(service.dspConfig.color).toEqual('primary');
        expect(service.dspConfig.production).toEqual(true);
        expect(service.dspApiConfig.apiProtocol).toEqual('https');
        expect(service.dspApiConfig.apiHost).toEqual('0.0.0.0');
        expect(service.dspApiConfig.apiPort).toEqual(3333);
        expect(service.dspApiConfig.apiPath).toEqual('');
        expect(service.dspApiConfig.zioPrefix).toEqual('/zio');
        expect(service.dspApiConfig.zioEndpoints).toEqual([]);
        expect(service.dspIiifConfig.iiifProtocol).toEqual('https');
        expect(service.dspIiifConfig.iiifHost).toEqual('0.0.0.0');
        expect(service.dspIiifConfig.iiifPort).toEqual(1024);
        expect(service.dspIiifConfig.iiifPath).toEqual('');
        expect(service.dspApiConfig.jsonWebToken).toEqual('mytoken');
        expect(service.dspApiConfig.logErrors).toEqual(true);
        expect(service.dspAppConfig.geonameToken).toEqual('geoname_token');
        expect(service.dspAppConfig.iriBase).toEqual('http://rdfh.ch');
        expect(service.dspInstrumentationConfig.environment).toEqual(
            'production'
        );
        expect(service.dspInstrumentationConfig.dataDog.enabled).toEqual(true);
        expect(service.dspInstrumentationConfig.dataDog.applicationId).toEqual(
            'app_id'
        );
        expect(service.dspInstrumentationConfig.dataDog.clientToken).toEqual(
            'client_token'
        );
        expect(service.dspInstrumentationConfig.dataDog.site).toEqual('site');
        expect(service.dspInstrumentationConfig.dataDog.service).toEqual(
            'dsp-app'
        );
        expect(service.dspInstrumentationConfig.rollbar.enabled).toEqual(true);
        expect(service.dspInstrumentationConfig.rollbar.accessToken).toEqual(
            'rollbar_token'
        );
    });
});
