import { Injectable } from '@angular/core';
import { KnoraApiConfig } from '@dasch-swiss/dsp-js';
import { DspInstrumentationConfig, DspRollbarConfig, DspDataDogConfig } from './main/declarations/dsp-instrumentation-config';
import { DspIiifConfig } from './main/declarations/dsp-iiif-config';

@Injectable({
    providedIn: 'root'
})
export class AppInitService {

    dspApiConfig: KnoraApiConfig;
    dspIiifConfig: DspIiifConfig;
    dspInstrumentationConfig: DspInstrumentationConfig;

    config: object;

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

                    // init datadog configuration
                    this.dspInstrumentationConfig = new DspInstrumentationConfig(
                        jsonConfig.environment,
                        new DspDataDogConfig(
                            jsonConfig.dataDog.active,
                            jsonConfig.dataDog.applicationId,
                            jsonConfig.dataDog.clientToken,
                            jsonConfig.dataDog.site,
                            jsonConfig.dataDog.service,
                        ),
                        new DspRollbarConfig(
                            jsonConfig.rollbar.active
                        )
                    );

                    // get all options from config
                    this.config = jsonConfig;

                    // set sanitized standard config options
                    this.config['apiProtocol'] = jsonConfig.apiProtocol;
                    this.config['apiHost'] = jsonConfig.apiHost;
                    this.config['apiPort'] = apiPort;
                    this.config['apiPath'] = apiPath;
                    this.config['jsonWebToken'] = jsonWebToken;
                    this.config['logErrors'] = logErrors;
                    this.config['iiifProtocol'] = jsonConfig.iiifProtocol;
                    this.config['iiifHost'] = jsonConfig.iiifHost;
                    this.config['iiifPort'] = iiifPort;
                    this.config['iiifPath'] = iiifPath;
                    this.config['iiifUrl'] = this.dspIiifConfig.iiifUrl;

                    resolve();
                }
                ).catch((err) => {
                    reject(err);
                });
        });
    }
}
