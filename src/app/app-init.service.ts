import { Injectable } from '@angular/core';
import { KnoraApiConfig } from '@dasch-swiss/dsp-js';
import { DspInstrumentationConfig, DspRollbarConfig, DspDataDogConfig } from './main/declarations/dsp-instrumentation-config';
import { DspIiifConfig } from './main/declarations/dsp-iiif-config';
import { DspAppConfig } from './main/declarations/dsp-app-config';

@Injectable({
    providedIn: 'root'
})
export class AppInitService {

    dspApiConfig: KnoraApiConfig;
    dspIiifConfig: DspIiifConfig;
    dspAppConfig: DspAppConfig;
    dspInstrumentationConfig: DspInstrumentationConfig;

    constructor() {
    }

    /**
     * fetches and initialises the configuration.
     *
     * @param path path to the config file.
     * @param env environment to be used (dev or prod).
     */
    Init(path: string, env: { name: string; production: boolean }): Promise<void> {

        return new Promise<void>((resolve, reject) => {
            fetch(`${path}/config.${env.name}.json`).then(
                (response: Response) => response.json()).then(jsonConfig => {

                    // check for presence of apiProtocol and apiHost
                    if (typeof jsonConfig.apiProtocol !== 'string' || typeof jsonConfig.apiHost !== 'string') {
                        throw new Error('config misses required members: apiProtocol and/or apiHost');
                    }

                    // make input type safe
                    const apiPort = (typeof jsonConfig.apiPort === 'number' ? jsonConfig.apiPort : null);
                    const apiPath = (typeof jsonConfig.apiPath === 'string' ? jsonConfig.apiPath : '');
                    const jsonWebToken = (typeof jsonConfig.jsonWebToken === 'string' ? jsonConfig.jsonWebToken : '');
                    const logErrors = (typeof jsonConfig.logErrors === 'boolean' ? jsonConfig.logErrors : false);

                    // init dsp-api configuration
                    this.dspApiConfig = new KnoraApiConfig(
                        jsonConfig.apiProtocol,
                        jsonConfig.apiHost,
                        apiPort,
                        apiPath,
                        jsonWebToken,
                        logErrors
                    );

                    const iiifPort = (typeof jsonConfig.iiifPort === 'number' ? jsonConfig.iiifPort : null);
                    const iiifPath = (typeof jsonConfig.iiifPath === 'string' ? jsonConfig.iiifPath : '');

                    // init iiif configuration
                    this.dspIiifConfig = new DspIiifConfig(
                        jsonConfig.iiifProtocol,
                        jsonConfig.iiifHost,
                        iiifPort,
                        iiifPath
                    );

                    // init dsp app extended configuration
                    this.dspAppConfig = new DspAppConfig(
                        jsonConfig.geonameToken
                    )

                    // init instrumentation configuration
                    this.dspInstrumentationConfig = new DspInstrumentationConfig(
                        jsonConfig.instrumentation.environment,
                        new DspDataDogConfig(
                            jsonConfig.instrumentation.dataDog.enabled,
                            jsonConfig.instrumentation.dataDog.applicationId,
                            jsonConfig.instrumentation.dataDog.clientToken,
                            jsonConfig.instrumentation.dataDog.site,
                            jsonConfig.instrumentation.dataDog.service,
                        ),
                        new DspRollbarConfig(
                            jsonConfig.instrumentation.rollbar.enabled,
                            jsonConfig.instrumentation.rollbar.accessToken
                        )
                    );

                    resolve();
                }
                ).catch((err) => {
                    reject(err);
                });
        });
    }
}
