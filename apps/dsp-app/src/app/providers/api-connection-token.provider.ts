import { AppConfigService, DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { Auth } from 'libs/vre/shared/app-config/src/lib/app-config/app-constants';

export const apiConnectionTokenProvider = {
    provide: DspApiConnectionToken,
    useFactory: (appConfigService: AppConfigService) => {
        appConfigService.dspApiConfig.jsonWebToken = localStorage.getItem(Auth.AccessToken);
        return new KnoraApiConnection(appConfigService.dspApiConfig);
    },
    deps: [AppConfigService],
};