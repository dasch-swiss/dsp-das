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
import {
    ApiResponseError,
    HealthEndpointSystem,
    KnoraApiConnection,
    MockHealth,
} from '@dasch-swiss/dsp-js';
import { of } from 'rxjs';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppErrorHandler } from './app-error-handler';
import { AppLoggingService } from '@dasch-swiss/vre/shared/app-logging';
import { MockProvider, MockService } from 'ng-mocks';
import { createSpyFromClass, Spy } from 'jest-auto-spies';
import { SystemEndpoint } from '@dasch-swiss/dsp-js/src/api/system/system-endpoint';

describe('AppErrorHandler', () => {
    let httpTestingController: HttpTestingController;
    let service: AppErrorHandler;
    let dspConnSpy: KnoraApiConnection;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                HttpClientTestingModule,
                MatDialogModule,
                MatSnackBarModule,
                NoopAnimationsModule,
            ],
            providers: [
                MockProvider(AppLoggingService),
                {
                    provide: MatDialog,
                    useValue: { open: () => of({ id: 1 }) },
                },
                MockProvider(
                    DspApiConnectionToken,
                    MockService(KnoraApiConnection)
                ),
            ],
        });
        service = TestBed.inject(AppErrorHandler);

        httpTestingController = TestBed.inject(HttpTestingController);

        dspConnSpy = TestBed.inject(DspApiConnectionToken);

        // (
        //     dspConnSpy.system
        //         .healthEndpoint as jasmine.SpyObj<HealthEndpointSystem>
        // ).getHealthStatus.and.callFake(() => {
        //     const health = MockHealth.mockRunning();
        //     return of(health);
        // });
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // https://www.beyondjava.net/jest-mocking-an-angular-service
    it('api is not healthy: should log 503 server error', () => {
        dspConnSpy.system.healthEndpoint.getHealthStatus() = jest.fn(() => {});
        service.showMessage(<ApiResponseError>{ error: 'gaga' });
        expect(dspConnSpy).toHaveBeenCalled();
    });
});
