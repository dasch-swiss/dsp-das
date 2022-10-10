import { OverlayContainer } from '@angular/cdk/overlay';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DspApiConnectionToken } from '../declarations/dsp-api-tokens';
import { DialogComponent } from '../dialog/dialog.component';
import { ErrorHandlerService } from './error-handler.service';
import { HttpStatusMsg } from '../../../assets/http/statusMsg';

describe('ErrorHandlerService', () => {
    let httpTestingController: HttpTestingController;
    let service: ErrorHandlerService;
    let overlayContainer: OverlayContainer;
    let _statusMsg: HttpStatusMsg;

    const errCanvas = require('../../../assets/test-data/api-error-502.json'); // has error.error.status of randomly chosen 502

    let dialog: MatDialog;

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

        overlayContainer = TestBed.inject(OverlayContainer);

        dialog = TestBed.inject(MatDialog);
        _statusMsg = new HttpStatusMsg;

    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('1) should throw the status of the server error received if the api is healthy and there is an error response as well as an error message', () => {
        // iterating through all entries and test for each status
        for (const [key, value] of Object.entries(_statusMsg.default)) {
            const s = Number(key);
            if (s && s > 499 && s < 600 && s !== 504) {
                // this test is only reflecting what has been implemented, so:
                // the actual content of the error message does not matter at all
                // the content of the response does not matter either - except to determine whether a 503 is thrown or
                // the err.status. The actual error.error.status is not used;
                // any error message is replaced hard coded.
                // only the error.status is reflected in the error thrown by the app if there exists an err.error.response.
                const err = errCanvas;
                err.status = s;
                const status = (err.hasOwnProperty('error') && err.error && !err.error['response']) ? 503 : err.status; // always 503 if there is no error response(?)
                const expectedErrMsg = `ERROR ${status}: Server side error — dsp-api not responding`; // how it was and still is implemented ...
                expect(function() {
                    service.handleServerSideErrors(err, true);
                }).toThrowError(expectedErrMsg);
            }
        };
    });

    //
    it('2) should throw the status of the error received if the api is healthy and there is a server error with response but no error response message ', () => {
        // iterating through all entries and test
        for (const [key, value] of Object.entries(_statusMsg.default)) {
            const s = Number(key);
            if (s && s > 499 && s < 600 && s !== 504) {
                // this test is only reflecting what has been implemented ...
                const err = errCanvas;
                err.status = s;
                err.error['response'] = {};
                const expectedErrMsg = `ERROR ${err.status}: Server side error — dsp-api not responding`; // how it was and still is implemented ...
                expect(function() {
                    service.handleServerSideErrors(err, true);
                }).toThrowError(expectedErrMsg);
            }
        };
    });

    it('3) should throw a 503 error if and the server is healthy and there is any error of any status but no error response (except 504)', () => {
        const error = require('../../../assets/test-data/api-error-502.json');
        error.error.response = undefined; // set message to undefined
        expect(function() {
            service.handleServerSideErrors(error, true);
        }).toThrowError('ERROR 503: Server side error — dsp-api not responding'); // how it was and still is implemented ...
        spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of({ id: 1 }) } as MatDialogRef<typeof DialogComponent>);
        expect(dialog).toBeDefined();
    });

    it('4) default errors whose message does not start with "ajax errors" should be thrown as happened', () => {
        // iterating through all entries and test
        for (const [key, value] of Object.entries(_statusMsg.default)) {
            const s = Number(key);
            const messageAsHappened = 'knora-api:error":"dsp.errors.ForbiddenException: Anonymous users aren\'t $' +
                'allowed to create resources","@context":{"knora-api":"http://api.knora.org/ontology/knora-api/v2#"}';
            const err = errCanvas;
            err.status = s;
            err.error['message'] = messageAsHappened;
            if (s && s < 499 || s > 600 || s === 504) { // like showMessage method
                expect(function() {
                    service.defaultErrorHandler(err);
                }).toThrowError(messageAsHappened); // the actual status code does not matter anymore
            }
        };
    });

    it('5) default errors which are "ajax errors" should be displayed as defined in _statusMsg.default', () => {
        // iterating through all entries and test
        for (const [key, value] of Object.entries(_statusMsg.default)) {
            const s = Number(key);
            if (s && s < 499 || s > 600 || s === 504) { // like showMessage method
                const err = errCanvas;
                err.status = s; // the
                err.error['message'] = 'ajax error followed by anything will be replaced by the messages defined in _statusMsg.default';
                // the actual error thrown is expected to be replaced by _statusMsg.default's definitions'
                const expectedMessage = `${value['message']} (${s}): ${value['description']}`;
                expect(function() {
                    service.defaultErrorHandler(err);
                }).toThrowError(expectedMessage);
            }
        };
    });

    // standard 500 test if server is coughing.
    it('6) should throw a 500 error if the server is not healthy and error of any status occurs except 504', () => {
        expect(function() {
            service.handleServerSideErrors(errCanvas, false);
        }).toThrowError('ERROR 500: Server side error — dsp-api is not healthy'); // how it was and still is implemented ...
        spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of({ id: 1 }) } as MatDialogRef<typeof DialogComponent>);
        expect(dialog).toBeDefined();
    });
});
