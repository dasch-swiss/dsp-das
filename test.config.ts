import { KnoraApiConfig } from '@dasch-swiss/dsp-js';
import { DspAppConfig } from 'src/app/main/declarations/dsp-app-config';
import { Session } from 'src/app/main/services/session.service';

export class TestConfig {

    public static ApiConfig = new KnoraApiConfig('http', '0.0.0.0', 3333);
    public static AppConfig = new DspAppConfig('knora', 'http://rdfh.ch');

    public static ProjectCode = '0001';

    public static CurrentSession: Session = {
        id: 1555226377250,
        user: {
            jwt: '',
            lang: 'en',
            name: 'root',
            projectAdmin: [],
            sysAdmin: false
        }
    };
}
