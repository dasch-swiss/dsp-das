import { Injectable } from '@angular/core';
import { KnoraApiConfig, KnoraApiConnection } from '@knora/api';
import { KuiConfig } from '@knora/core';

@Injectable()
export class AppInitService {

    static knoraApiConnection: KnoraApiConnection;

    static knoraApiConfig: KnoraApiConfig;

    static kuiConfig: KuiConfig;

    constructor() { }

    Init() {

        return new Promise<void>((resolve, reject) => {

            // init knora-ui configuration
            AppInitService.kuiConfig = window['tempConfigStorage'] as KuiConfig;

            // init knora-api configuration
            AppInitService.knoraApiConfig = new KnoraApiConfig(
                AppInitService.kuiConfig.knora.apiProtocol,
                AppInitService.kuiConfig.knora.apiHost,
                AppInitService.kuiConfig.knora.apiPort
            );

            // set knora-api connection configuration
            AppInitService.knoraApiConnection = new KnoraApiConnection(AppInitService.knoraApiConfig);

            resolve();
        });
    }
}
