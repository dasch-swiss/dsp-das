import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import {
  AppConfigService,
  DspApiConnectionToken,
} from '@dasch-swiss/vre/shared/app-config';
import { Auth } from '@dasch-swiss/vre/shared/app-config';

export const apiConnectionTokenProvider = {
  provide: DspApiConnectionToken,
  useFactory: (appConfigService: AppConfigService) => {
    appConfigService.dspApiConfig.jsonWebToken = localStorage.getItem(
      Auth.AccessToken
    );
    return new KnoraApiConnection(appConfigService.dspApiConfig);
  },
  deps: [AppConfigService],
};
