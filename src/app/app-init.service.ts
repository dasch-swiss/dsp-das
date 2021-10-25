import { Inject, Injectable } from '@angular/core';
import { KnoraApiConfig } from '@dasch-swiss/dsp-js';
import { DspInstrumentationConfig, DspRollbarConfig, DspDataDogConfig } from './main/declarations/dsp-instrumentation-config';
import { DspIiifConfig } from './main/declarations/dsp-iiif-config';
import { DspAppConfig } from './main/declarations/dsp-app-config';
import { IConfig } from './main/declarations/app-config';
import { APP_CONFIG } from './main/declarations/dsp-api-tokens';

@Injectable({
    providedIn: 'root'
})
export class AppInitService {

    public dspApiConfig: KnoraApiConfig | null;
    public dspIiifConfig: DspIiifConfig | null;
    public dspAppConfig: DspAppConfig | null;
    public dspInstrumentationConfig: DspInstrumentationConfig | null;

    constructor(
        @Inject(APP_CONFIG) private config: IConfig
    ) {
        // check for presence of apiProtocol and apiHost
        if (typeof this.config.apiProtocol !== 'string' || typeof this.config.apiHost !== 'string') {
            throw new Error('config misses required members: apiProtocol and/or apiHost');
        }

        // make input type safe
        const apiPort = (typeof this.config.apiPort === 'number' ? this.config.apiPort : null);
        const apiPath = (typeof this.config.apiPath === 'string' ? this.config.apiPath : '');
        const jsonWebToken = (typeof this.config.jsonWebToken === 'string' ? this.config.jsonWebToken : '');
        const logErrors = (typeof this.config.logErrors === 'boolean' ? this.config.logErrors : false);

        // init dsp-api configuration
        this.dspApiConfig = new KnoraApiConfig(
            this.config.apiProtocol,
            this.config.apiHost,
            apiPort,
            apiPath,
            jsonWebToken,
            logErrors
        );

        const iiifPort = (typeof this.config.iiifPort === 'number' ? this.config.iiifPort : null);
        const iiifPath = (typeof this.config.iiifPath === 'string' ? this.config.iiifPath : '');

        // init iiif configuration
        this.dspIiifConfig = new DspIiifConfig(
            this.config.iiifProtocol,
            this.config.iiifHost,
            iiifPort,
            iiifPath
        );

        // init dsp app extended configuration
        this.dspAppConfig = new DspAppConfig(
            this.config.geonameToken
        )

        // init instrumentation configuration
        this.dspInstrumentationConfig = new DspInstrumentationConfig(
            this.config.instrumentation.environment,
            new DspDataDogConfig(
                this.config.instrumentation.dataDog.enabled,
                this.config.instrumentation.dataDog.applicationId,
                this.config.instrumentation.dataDog.clientToken,
                this.config.instrumentation.dataDog.site,
                this.config.instrumentation.dataDog.service,
            ),
            new DspRollbarConfig(
                this.config.instrumentation.rollbar.enabled,
                this.config.instrumentation.rollbar.accessToken
            )
        )
    }
}
