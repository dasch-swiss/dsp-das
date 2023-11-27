import { Inject, Injectable } from '@angular/core';
import { KnoraApiConfig } from '@dasch-swiss/dsp-js';
import { appConfigSchema } from './app-config-schema';
import { AppConfigToken } from './dsp-api-tokens';
import { DspAppConfig } from './dsp-app-config';
import { DspConfig } from './dsp-config';
import { DspIiifConfig } from './dsp-iiif-config';
import { DspDataDogConfig, DspInstrumentationConfig, DspRollbarConfig } from './dsp-instrumentation-config';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    private readonly _dspConfig: DspConfig;
    private readonly _dspApiConfig: KnoraApiConfig;
    private readonly _dspIiifConfig: DspIiifConfig;
    private readonly _dspAppConfig: DspAppConfig;
    private readonly _dspInstrumentationConfig: DspInstrumentationConfig;

    constructor(@Inject(AppConfigToken) private _appConfigJson: unknown) {
        const config = appConfigSchema.parse(_appConfigJson);

        const env = config.instrumentation.environment;

        this._dspConfig = new DspConfig(
            config.dspRelease,
            env,
            env.includes('prod') || env.includes('production')
        );

        this._dspApiConfig = new KnoraApiConfig(
            config.apiProtocol,
            config.apiHost,
            config.apiPort,
            config.apiPath,
            config.jsonWebToken,
            config.logErrors
        );

        // init iiif configuration
        this._dspIiifConfig = new DspIiifConfig(
            config.iiifProtocol,
            config.iiifHost,
            config.iiifPort,
            config.iiifPath
        );

        // init dsp app extended configuration
        this._dspAppConfig = new DspAppConfig(config.geonameToken, config.iriBase);

        // init instrumentation configuration
        this._dspInstrumentationConfig = new DspInstrumentationConfig(
            env,
            new DspDataDogConfig(
                config.instrumentation.dataDog.enabled,
                config.instrumentation.dataDog.applicationId,
                config.instrumentation.dataDog.clientToken,
                config.instrumentation.dataDog.site,
                config.instrumentation.dataDog.service
            ),
            new DspRollbarConfig(
                config.instrumentation.rollbar.enabled,
                config.instrumentation.rollbar.accessToken
            )
        );
    }

    get dspConfig(): DspConfig {
        return this._dspConfig;
    }

    get dspApiConfig(): KnoraApiConfig {
        return this._dspApiConfig;
    }

    get dspIiifConfig(): DspIiifConfig {
        return this._dspIiifConfig;
    }

    get dspAppConfig(): DspAppConfig {
        return this._dspAppConfig;
    }

    get dspInstrumentationConfig(): DspInstrumentationConfig {
        return this._dspInstrumentationConfig;
    }
}
