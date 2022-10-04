import { OverlayContainer } from '@angular/cdk/overlay';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ApiResponseError, HealthEndpointSystem, MockHealth } from '@dasch-swiss/dsp-js';
import { of } from 'rxjs';
import { DspApiConnectionToken } from '../declarations/dsp-api-tokens';
import { DialogComponent } from '../dialog/dialog.component';
import { ErrorHandlerService } from './error-handler.service';
import { HttpStatusMsg } from '../../../assets/http/statusMsg';

fdescribe('ErrorHandlerService', () => {
    let httpTestingController: HttpTestingController;
    let service: ErrorHandlerService;
    let overlayContainer: OverlayContainer;
    let _statusMsg: HttpStatusMsg;

    const apiErr = require('../../../assets/test-data/api-error-502.json'); // has error.error.status of randomly chosen 502

    let dialog: MatDialog;

    function apiResponseError(status: number, msg: string): ApiResponseError {
        const err = require('../../../assets/test-data/api-error-502.json'); // has error.error.status of randomly chosen 502
        err.status = status;
        err.error.status = status;
        err.message = msg;
        return err;
    }

    function defaultApiResponseError(status: number, msg: string): ApiResponseError {
        const err = require('../../../assets/test-data/api-error-502.json'); // has error.error.status of randomly chosen 502
        err.status = status;
        err.error.status = status;
        err.error['message'] = msg;
        return err;
    }

    beforeEach(() => {

        const apiEndpointSpyObj = {
            v2: {
                auth: jasmine.createSpyObj('auth', ['logout'])
            },
            system: {
                healthEndpoint: jasmine.createSpyObj('healthEndpoint', ['getHealthStatus'])
            }
        };

        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                HttpClientTestingModule,
                MatDialogModule,
                MatSnackBarModule,
                NoopAnimationsModule
            ],
            providers: [
                {
                    provide: MatDialog,
                    useValue: { open: () => of({ id: 1 }) },
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: apiEndpointSpyObj
                }
            ]
        });
        service = TestBed.inject(ErrorHandlerService);

        httpTestingController = TestBed.inject(HttpTestingController);

        const dspConnSpy = TestBed.inject(DspApiConnectionToken);
        (dspConnSpy.system.healthEndpoint as jasmine.SpyObj<HealthEndpointSystem>).getHealthStatus.and.callFake(
            () => {
                const health = MockHealth.mockRunning();
                return of(health);
            }
        );

        overlayContainer = TestBed.inject(OverlayContainer);

        dialog = TestBed.inject(MatDialog);
        _statusMsg = new HttpStatusMsg;

    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('1) 500 errors should be handled the same as before if the api is not healthy', () => {
        expect(service).toBeTruthy();
        // iterating through all entries and test
        for (const [key, value] of Object.entries(_statusMsg.default)) {
            const s = Number(key);
            if (s && s > 499 && s < 600 && s !== 504) {
                const err = apiResponseError(s, value['message']);
                // for comparing with the old error message
                const oldErrMsg = service.showMessageOld(err, false);
                expect(function() {
                    service.handleServerSideErrors(err, false);
                }).toThrowError(oldErrMsg);
            }
        };
    });

    it('2) 500 errors should be handled the same as before if the api is healthy', () => {
        expect(service).toBeTruthy();
        // iterating through all entries and test
        for (const [key, value] of Object.entries(_statusMsg.default)) {
            const s = Number(key);
            if (s && s > 499 && s < 600 && s !== 504) {
                const err = apiResponseError(+key, value['message']);
                // for comparing with the old error message
                const oldErrMsg = service.showMessageOld(err, true);
                expect(function() {
                    service.handleServerSideErrors(err, true);
                }).toThrowError(oldErrMsg);
            }
        };
    });

    it('3) default errors which are not ajax errors should be displayed as defined in _statusMsg.default', () => {
        // iterating through all entries and test
        for (const [key, value] of Object.entries(_statusMsg.default)) {
            const s = Number(key);
            if (s && s < 499 || s > 600 ) {
                const expectedMessage = `${value['message']} (${s}): ${value['description']}`;
                const err = defaultApiResponseError(s, expectedMessage);
                expect(function() {
                    service.defaultErrorHandler(err);
                }).toThrowError(expectedMessage);
            }
        };
    });

    // standard 500 test
    it('4) should throw an error with status 500 if there is a server error with an error response and the server is not healthy', () => {
        const oldErrMsg = service.showMessageOld(apiErr, false);
        expect(function() {
            service.handleServerSideErrors(apiErr, false);
        }).toThrowError(oldErrMsg);
        spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of({ id: 1 }) } as MatDialogRef<typeof DialogComponent>);
        expect(dialog).toBeDefined();

    });

    // standard 500 test if server is coughing.
    it('5) should throw a 500 if there any errors of any status except 504 without an error response and the server is not healthy', () => {
        apiErr.error.response = undefined; // set to undefined, so it should throw a 503
        expect(function() {
            service.handleServerSideErrors(apiErr, false);
        }).toThrowError('ERROR 500: Server side error — dsp-api is not healthy');
        spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of({ id: 1 }) } as MatDialogRef<typeof DialogComponent>);
        expect(dialog).toBeDefined();
    });

    it('6) should throw a 503 if there any error of any status except 504 without an error response and the server is healthy', () => {
        const error = require('../../../assets/test-data/api-error-502.json');
        error.error.response = undefined; // set message to undefined
        expect(function() {
            service.handleServerSideErrors(error, true);
        }).toThrowError('ERROR 503: Server side error — dsp-api not responding');
        spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of({ id: 1 }) } as MatDialogRef<typeof DialogComponent>);
        expect(dialog).toBeDefined();
    });
});
