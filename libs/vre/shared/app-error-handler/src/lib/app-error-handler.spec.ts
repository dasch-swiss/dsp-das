import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
    MatDialog,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
    BrowserAnimationsModule,
    NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { HealthEndpointSystem, MockHealth } from '@dasch-swiss/dsp-js';
import { of } from 'rxjs';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppErrorHandler } from './app-error-handler';

describe('AppErrorHandler', () => {
    let httpTestingController: HttpTestingController;
    let service: AppErrorHandler;

    let dialog: MatDialog;

    beforeEach(() => {
        const apiEndpointSpyObj = {
            v2: {
                auth: jasmine.createSpyObj('auth', ['logout']),
            },
            system: {
                healthEndpoint: jasmine.createSpyObj('healthEndpoint', [
                    'getHealthStatus',
                ]),
            },
        };

        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                HttpClientTestingModule,
                MatDialogModule,
                MatSnackBarModule,
                NoopAnimationsModule,
            ],
            providers: [
                {
                    provide: MatDialog,
                    useValue: { open: () => of({ id: 1 }) },
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: apiEndpointSpyObj,
                },
            ],
        });
        service = TestBed.inject(AppErrorHandler);

        httpTestingController = TestBed.inject(HttpTestingController);

        const dspConnSpy = TestBed.inject(DspApiConnectionToken);
        (
            dspConnSpy.system
                .healthEndpoint as jasmine.SpyObj<HealthEndpointSystem>
        ).getHealthStatus.and.callFake(() => {
            const health = MockHealth.mockRunning();
            return of(health);
        });

        dialog = TestBed.inject(MatDialog);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    xit('api is not healthy: should return 503 server error', () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const error = require('../../../assets/test-data/api-error-0.json');

        service.showMessage(error);

        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of({ id: 1 }),
        } as MatDialogRef<typeof DialogComponent>);
        expect(dialog).toBeDefined();
    });
});
