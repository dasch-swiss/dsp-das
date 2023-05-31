import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import { TestConfig } from './../../../test.config';
import { CacheService } from '../cache/cache.service';
import {
    DspApiConfigToken,
    DspApiConnectionToken,
} from '@dasch-swiss/vre/shared/app-config';
import { AuthenticationService } from './authentication.service';
import { DatadogRumService } from './datadog-rum.service';
import { SessionService } from './session.service';

describe('AuthenticationService', () => {
    let service: AuthenticationService;

    const authEndpointSpyObj = {
        v2: {
            auth: jasmine.createSpyObj('auth', ['logout']),
        },
    };

    const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['destroy']);

    const datadogRumServiceSpy = jasmine.createSpyObj('datadogRumService', [
        '',
        'removeActiveUser',
    ]);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, MatSnackBarModule],
            providers: [
                AppConfigService,
                SessionService,
                {
                    provide: DspApiConfigToken,
                    useValue: TestConfig.ApiConfig,
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: authEndpointSpyObj,
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpy,
                },
                {
                    provide: DatadogRumService,
                    useValue: datadogRumServiceSpy,
                },
            ],
        });
        service = TestBed.inject(AuthenticationService);
    });

    // mock sessionStorage
    beforeEach(() => {
        let store = {};

        spyOn(sessionStorage, 'getItem').and.callFake(
            (key: string): string => store[key] || null
        );
        spyOn(sessionStorage, 'removeItem').and.callFake(
            (key: string): void => {
                delete store[key];
            }
        );
        spyOn(sessionStorage, 'setItem').and.callFake(
            (key: string, value: string): string => (store[key] = <any>value)
        );
        spyOn(sessionStorage, 'clear').and.callFake(() => {
            store = {};
        });

        spyOn(localStorage, 'getItem').and.callFake(
            (key: string): string => store[key] || null
        );
        spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
            delete store[key];
        });
        spyOn(localStorage, 'setItem').and.callFake(
            (key: string, value: string): string => (store[key] = <any>value)
        );
        spyOn(localStorage, 'clear').and.callFake(() => {
            store = {};
        });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
