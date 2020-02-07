import { KnoraApiConfig } from '@knora/api';
import { Session } from '@knora/core';

export class TestConfig {

    public static ApiConfig = new KnoraApiConfig('http', '0.0.0.0', 3333);
    public static AppConfig = { name: 'Knora app', url: '0.0.0.0:4200' };

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

    public static SystemAdminSession: Session = {
        id: 1555226377251,
        user: {
            jwt: '',
            lang: 'en',
            name: 'root',
            projectAdmin: ['http://rdfh.ch/projects/0803'],
            sysAdmin: true
        }
    };
}