/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ErrorHandler, inject, Injectable } from '@angular/core';
import { AppLoggingService } from '@dasch-swiss/vre/shared/app-logging';
import { HttpErrorResponse } from '@angular/common/http';
import {
    ApiResponseData,
    ApiResponseError,
    HealthResponse,
    KnoraApiConnection,
} from '@dasch-swiss/dsp-js';
import { HttpStatusMsg } from '@dasch-swiss/vre/shared/assets/status-msg';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { SessionService } from '@dasch-swiss/vre/shared/app-session';
import { AjaxError } from 'rxjs/ajax';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';

@Injectable({
    providedIn: 'root',
})
export class AppErrorHandler implements ErrorHandler {
    logger: AppLoggingService = inject(AppLoggingService);
    dspApiConnection: KnoraApiConnection = inject(DspApiConnectionToken);
    notificationService: NotificationService = inject(NotificationService);
    sessionService: SessionService = inject(SessionService);
    httpStatusMsg: HttpStatusMsg = inject(HttpStatusMsg);

    /**
     * Logs out the error using the logging service.
     * @param error the error to log.
     */
    handleError(error: Error): void {
        if (error instanceof HttpErrorResponse) {
            // HTTP related error
            this.logger.error('Caught HttpErrorResponse error', {}, error);
        } else if (error instanceof TypeError) {
            // Runtime exceptions mostly introduced by Developer's code
            this.logger.error('Caught TypeError', {}, error);
        } else if (error instanceof ReferenceError) {
            // Runtime exceptions mostly introduced by Developer's code
            this.logger.error('Caught ReferenceError', {}, error);
        } else {
            // catch-all: catch rest of errors
            this.logger.error('Caught other error', {}, error);
        }
    }

    showMessage(error: ApiResponseError) {
        // in case of (internal) server error
        const apiServerError =
            error.error &&
            !(error.error instanceof AjaxError && error.error['response']);

        const apiResponseMessage =
            error.error instanceof AjaxError && error.error['response']
                ? error.error['response'].error
                : undefined;

        if (
            ((error.status > 499 && error.status < 600) || apiServerError) &&
            error.status !== 504
        ) {
            let status = apiServerError ? 503 : error.status;

            // check if the api is healthy:
            (
                this.dspApiConnection.system.healthEndpoint.getHealthStatus() as Observable<
                    ApiResponseData<HealthResponse>
                >
            )
                .pipe(take(1))
                .subscribe(
                    (response: ApiResponseData<HealthResponse>) => {
                        if (!response.body.status) {
                            const healthError: ApiResponseError = {
                                error: response.body.message,
                                method: response.method,
                                status: 500,
                                url: error.url,
                            };
                            status = 500;
                            error = healthError;
                            this.logger.error(
                                `ERROR ${status}: Server side error — dsp-api is not healthy`
                            );
                        } else {
                            this.logger.error(
                                `ERROR ${status}: Server side error — dsp-api not responding`
                            );
                        }
                    },
                    (healthError: ApiResponseError) => {
                        this.logger.error(
                            `ERROR ${status}: Server side error — dsp-api not responding`,
                            healthError
                        );
                        error = healthError;
                    }
                );

            error.status = status;
            this.notificationService.openSnackBar(error);
        } else if (error.status === 401 && typeof error.error !== 'string') {
            // logout if error status is a 401 error and comes from a DSP-JS request
            this.dspApiConnection.v2.auth.logout().subscribe(
                () => {
                    // destroy session
                    this.sessionService.destroySession();

                    // reload the page
                    window.location.reload();
                },
                (logoutError: ApiResponseError) => {
                    this.notificationService.openSnackBar(logoutError);
                    if (logoutError.error instanceof AjaxError) {
                        this.logger.error(
                            `Logout ajax error`,
                            {},
                            new Error(logoutError.error['message'])
                        );
                    } else {
                        this.logger.error(
                            `Logout other error`,
                            {},
                            new Error(logoutError.error)
                        );
                    }
                }
            );
        } else {
            // open snack bar in any other case
            this.notificationService.openSnackBar(error);
            // log error to Rollbar (done automatically by simply throwing a new Error)
            if (error instanceof ApiResponseError) {
                if (
                    error.error &&
                    error.error instanceof AjaxError &&
                    !error.error['message'].startsWith('ajax error')
                ) {
                    // the Api response error contains a complex error message from dsp-js-lib
                    this.logger.error(
                        `Api response error`,
                        {},
                        new Error(error.error['message'])
                    );
                } else {
                    const defaultStatusMsg = this.httpStatusMsg.default;
                    const message = `${
                        defaultStatusMsg[error.status].message
                    } (${error.status}): ${
                        defaultStatusMsg[error.status].description
                    }`;
                    this.logger.error(`Error`, {}, new Error(message));
                }
            } else {
                this.logger.error(`Error`, {}, new Error(error));
            }
        }
    }
}
