import { KnoraApiConfig } from '@dasch-swiss/dsp-js';
import { Session } from '@dasch-swiss/vre/core/session';

export class TestConfig {
  public static ApiConfig = new KnoraApiConfig('http', '127.0.0.1', 3333);

  public static ProjectCode = '0001';

  public static ProjectUuid = '0123';

  public static CurrentSession: Session = {
    id: 1555226377250,
    user: {
      jwt: '',
      lang: 'en',
      name: 'root',
      projectAdmin: [],
      sysAdmin: false,
    },
  };
}
