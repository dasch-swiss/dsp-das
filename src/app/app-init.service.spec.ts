import { TestBed } from '@angular/core/testing';
import { AppInitService } from './app-init.service';

describe('TestService', () => {
    let service: AppInitService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AppInitService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch the fully specified config file when method Init is called', async () => {

        const fetchSpy = spyOn(window, 'fetch').and.callFake(
            path => Promise.resolve(new Response(JSON.stringify({
                apiProtocol: 'http',
                apiHost: '0.0.0.0',
                apiPort: 3333,
                apiPath: 'mypath',
                jsonWebToken: 'mytoken',
                logErrors: true,
                geonameToken: "geoname_token",
                instrumentation: {
                    environment: 'dev',
                    dataDog: {
                        enabled: true,
                        applicationId: 'app_id',
                        clientToken: 'client_token',
                        site: 'site',
                        service: 'dsp-app'
                    },
                    rollbar: {
                        enabled: true,
                        accessToken: 'rollbar_token'
                    }
                }

            })))
        );

        await service.Init('config', { name: 'prod', production: true });

        expect(service.dspApiConfig.apiProtocol).toEqual('http');
        expect(service.dspApiConfig.apiHost).toEqual('0.0.0.0');
        expect(service.dspApiConfig.apiPort).toEqual(3333);
        expect(service.dspApiConfig.apiPath).toEqual('mypath');
        expect(service.dspApiConfig.jsonWebToken).toEqual('mytoken');
        expect(service.dspApiConfig.logErrors).toEqual(true);
        expect(service.dspAppConfig.geonameToken).toEqual('geoname_token');
        expect(service.dspInstrumentationConfig.environment).toEqual('dev');
        expect(service.dspInstrumentationConfig.dataDog.enabled).toEqual(true);
        expect(service.dspInstrumentationConfig.dataDog.applicationId).toEqual('app_id');
        expect(service.dspInstrumentationConfig.dataDog.clientToken).toEqual('client_token');
        expect(service.dspInstrumentationConfig.dataDog.site).toEqual('site');
        expect(service.dspInstrumentationConfig.dataDog.service).toEqual('dsp-app');
        expect(service.dspInstrumentationConfig.rollbar.enabled).toEqual(true);
        expect(service.dspInstrumentationConfig.rollbar.accessToken).toEqual('rollbar_token');

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith('config/config.prod.json');

    });

    it('should fetch the minimally specified config file when method Init is called', async () => {

        const fetchSpy = spyOn(window, 'fetch').and.callFake(
            path => Promise.resolve(new Response(JSON.stringify({
                apiProtocol: 'http',
                apiHost: '0.0.0.0',
                instrumentation: {
                    environment: 'dev',
                    dataDog: {
                        enabled: true,
                        applicationId: 'app_id',
                        clientToken: 'client_token',
                        site: 'site',
                        service: 'dsp-app'
                    },
                    rollbar: {
                        enabled: true,
                        accessToken: 'rollbar_token'
                    }
                }
            })))
        );

        await service.Init('config', { name: 'prod', production: true });

        expect(service.dspApiConfig.apiProtocol).toEqual('http');
        expect(service.dspApiConfig.apiHost).toEqual('0.0.0.0');
        expect(service.dspApiConfig.apiPort).toEqual(null);
        expect(service.dspApiConfig.apiPath).toEqual('');
        expect(service.dspApiConfig.jsonWebToken).toEqual('');
        expect(service.dspApiConfig.logErrors).toEqual(false);

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith('config/config.prod.json');

    });

    it('should fetch the config file with additional options when method Init is called', async () => {

        const fetchSpy = spyOn(window, 'fetch').and.callFake(
            path => Promise.resolve(new Response(JSON.stringify({
                apiProtocol: 'http',
                apiHost: '0.0.0.0',
                instrumentation: {
                    environment: 'dev',
                    dataDog: {
                        enabled: true,
                        applicationId: 'app_id',
                        clientToken: 'client_token',
                        site: 'site',
                        service: 'dsp-app'
                    },
                    rollbar: {
                        enabled: true,
                        accessToken: 'rollbar_token'
                    }
                }
            })))
        );

        await service.Init('config', { name: 'prod', production: true });

        expect(service.dspApiConfig.apiProtocol).toEqual('http');
        expect(service.dspApiConfig.apiHost).toEqual('0.0.0.0');
        expect(service.dspApiConfig.apiPort).toEqual(null);
        expect(service.dspApiConfig.apiPath).toEqual('');
        expect(service.dspApiConfig.jsonWebToken).toEqual('');
        expect(service.dspApiConfig.logErrors).toEqual(false);

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith('config/config.prod.json');

    });

    it('should throw an error if required members are missing on the config object', async () => {

        const fetchSpy = spyOn(window, 'fetch').and.callFake(
            path => Promise.resolve(new Response(JSON.stringify({})))
        );

        await expectAsync(service.Init('config', {
            name: 'prod',
            production: true
        }))
            .toBeRejectedWith(new Error('config misses required members: apiProtocol and/or apiHost'));

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith('config/config.prod.json');

    });

    it('should throw an error if "apiProtocol" is missing on the config object', async () => {

        const fetchSpy = spyOn(window, 'fetch').and.callFake(
            path => Promise.resolve(new Response(JSON.stringify({
                apiHost: '0.0.0.0'
            })))
        );

        await expectAsync(service.Init('config', {
            name: 'prod',
            production: true
        }))
            .toBeRejectedWith(new Error('config misses required members: apiProtocol and/or apiHost'));

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith('config/config.prod.json');

    });

    it('should throw an error if "apiHost" is missing on the config object', async () => {

        const fetchSpy = spyOn(window, 'fetch').and.callFake(
            path => Promise.resolve(new Response(JSON.stringify({
                apiProtocol: 'http'
            })))
        );

        await expectAsync(service.Init('config', {
            name: 'prod',
            production: true
        }))
            .toBeRejectedWith(new Error('config misses required members: apiProtocol and/or apiHost'));

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith('config/config.prod.json');

    });

});
