import { Injectable } from '@angular/core';
import { KuiConfig } from '@knora/core';
import { KnoraApiConnection, KnoraApiConfig } from '@knora/api';

@Injectable()
export class AppInitService {

    static knoraApiConnection: KnoraApiConnection;

    static kuiConfig: KuiConfig;

    constructor() { }

    Init() {

        return new Promise<void>((resolve, reject) => {

            // init knora-ui configuration
            AppInitService.kuiConfig = window['tempConfigStorage'] as KuiConfig;

            // init knora-api configuration
            const knoraApiConfig: KnoraApiConfig = new KnoraApiConfig(
                AppInitService.kuiConfig.knora.apiProtocol,
                AppInitService.kuiConfig.knora.apiHost,
                AppInitService.kuiConfig.knora.apiPort
            );

            // set knora-api connection configuration
            AppInitService.knoraApiConnection = new KnoraApiConnection(knoraApiConfig);

            resolve();
        });
    }
}
