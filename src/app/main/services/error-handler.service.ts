import { Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ApiResponseData, ApiResponseError, HealthResponse, KnoraApiConnection, LogoutResponse } from '@dasch-swiss/dsp-js';
import { HttpStatusMsg } from 'src/assets/http/statusMsg';
import { DspApiConnectionToken } from '../declarations/dsp-api-tokens';
import { DialogComponent } from '../dialog/dialog.component';
import { NotificationService } from '../services/notification.service';
import { SessionService } from '../services/session.service';

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {

    dialogRef: MatDialogRef<any>;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _notification: NotificationService,
        private _dialog: MatDialog,
        private _session: SessionService,
        private _statusMsg: HttpStatusMsg
    ) { }

    /**
     * handles errors according to its status
     * @param error ApiResponseError
     */
    showMessage(error: ApiResponseError) {
        let errorToThrow;
        // if there is any server error (500-599) or there is any error but no error response
        if (((error.status > 499 && error.status < 600) || (error.error && !error.error['response'])) && error.status !== 504) {
            // check if the api is healthy:
            this._dspApiConnection.system.healthEndpoint.getHealthStatus().subscribe(
                (response: ApiResponseData<HealthResponse>) => {
                    this.handleServerSideErrors(error, response.body.status !== 'unhealthy');
                });

        } else if (error.status === 401 && typeof(error.error) !== 'string') {
                // logout if error status is a 401 error and comes from a DSP-JS request
                this._dspApiConnection.v2.auth.logout().subscribe(
                    (logoutResponse: ApiResponseData<LogoutResponse>) => {

                        // destroy session
                        this._session.destroySession();

                        // reload the page
                        window.location.reload();
                    },
                    (logoutError: ApiResponseError) => {
                        this._notification.openSnackBar(logoutError);
                        throw new Error(logoutError.error['message']);
                    }
                );

        } else if (error instanceof ApiResponseError) { // all others which are ApiResponseErrors
            this.defaultErrorHandler(error);
        } else { // this should not be the case if typed ... but it could be a string as well ...
            throw new Error(error);
        }
    }

    /**
     * handles all server side errors, so all errors between status 500 and 599 except 504
     * Always throws a 500 error except there is an ApiResponseError ... then it throws a 503
     *
     * @param error ApiResponseError
     * @param isHealthy whether the api is healthy or not
     */
    handleServerSideErrors(error: ApiResponseError, isHealthy: Boolean): void {
        const status = (error.error && !error.error['response']) ? 503 : error.status; // always 503 if there is no error response
        // dialog
        const apiResponseMessage = (error.error['response'] ? error.error['response'].error : undefined);
        const dialogConfig: MatDialogConfig = {
            width: '100vw',
            maxWidth: '100vw',
            height: '100vh',
            maxHeight: '100vh',
            position: {
                top: '0'
            },
            data: { mode: 'error', id: status, comment: apiResponseMessage, fullSize: true },
            disableClose: true
        };

        if (!this.dialogRef) {
            this.dialogRef = this._dialog.open(
                DialogComponent,
                dialogConfig
            );
        }
        // throw the error
        if ( isHealthy ) {
            // this equals the old error handler service but makes no sense imho.
            throw new Error(`ERROR ${status}: Server side error — dsp-api not responding`);
        } else {
            // this equals the old error handler service but makes no sense imho.
            // todo: Change this to ${status} like possibly intended?
            throw new Error('ERROR 500: Server side error — dsp-api is not healthy');
        }
    }


    /**
     * handles all other errors which are defined
     * @param error ApiResponseError
     */
    defaultErrorHandler(error: ApiResponseError) {
        // open snack bar
        this._notification.openSnackBar(error);
        // log error to Rollbar (done automatically by simply throwing a new Error)
        if (error.error && !error.error['message'].startsWith('ajax error')) {
            // the Api response error contains a complex error message from dsp-js-lib
            throw new Error(error.error['message']);
        } else {
            const defaultStatusMsg = this._statusMsg.default;
            const message = `${defaultStatusMsg[error.status].message} (${error.status}): ${defaultStatusMsg[error.status].description}`;
            throw new Error(message);
        }
    }

    showMessageOld(error: ApiResponseError, fakeHealth: Boolean) {
        let msg;
        // in case of (internal) server error
        const apiServerError = (error.error && !error.error['response']);

        const apiResponseMessage = (error.error['response'] ? error.error['response'].error : undefined);

        if (((error.status > 499 && error.status < 600) || apiServerError) && error.status !== 504) {

            let status = (apiServerError ? 503 : error.status);

            // check if the api is healthy:
            this._dspApiConnection.system.healthEndpoint.getHealthStatus().subscribe(
                (response: ApiResponseData<HealthResponse>) => {
                    if (!fakeHealth) {
                        const healthError: ApiResponseError = {
                            error: response.body.message,
                            method: response.method,
                            status: 500,
                            url: error.url
                        };
                        status = 500;
                        error = healthError;
                        msg = `ERROR ${status}: Server side error — dsp-api is not healthy`;
                    } else {
                        msg = `ERROR ${status}: Server side error — dsp-api not responding`;
                    }
                },
                (healthError: ApiResponseError) => {
                    error = healthError;
                }
            );

            // open error message in full size view
            const dialogConfig: MatDialogConfig = {
                width: '100vw',
                maxWidth: '100vw',
                height: '100vh',
                maxHeight: '100vh',
                position: {
                    top: '0'
                },
                data: { mode: 'error', id: status, comment: apiResponseMessage, fullSize: true },
                disableClose: true
            };

            if (!this.dialogRef) {
                this.dialogRef = this._dialog.open(
                    DialogComponent,
                    dialogConfig
                );
            }

        } else if (error.status === 401 && typeof(error.error) !== 'string') {
            // logout if error status is a 401 error and comes from a DSP-JS request
            this._dspApiConnection.v2.auth.logout().subscribe(
                (logoutResponse: ApiResponseData<LogoutResponse>) => {

                    // destroy session
                    this._session.destroySession();

                    // reload the page
                    window.location.reload();
                },
                (logoutError: ApiResponseError) => {
                    this._notification.openSnackBar(logoutError);
                    msg = logoutError.error['message'];
                }
            );

        } else {
            // open snack bar in any other case
            this._notification.openSnackBar(error);
            // log error to Rollbar (done automatically by simply throwing a new Error)
            if (error instanceof ApiResponseError) {
                if (error.error && !error.error['message'].startsWith('ajax error')) {
                    // the Api response error contains a complex error message from dsp-js-lib
                    msg = error.error['message'];
                } else {
                    const defaultStatusMsg = this._statusMsg.default;
                    const message = `${defaultStatusMsg[error.status].message} (${error.status}): ${defaultStatusMsg[error.status].description}`;
                    msg = message;
                }
            } else {
                msg = error['message'];
            }

        }
        console.log(msg);
        return msg;
    }
}
