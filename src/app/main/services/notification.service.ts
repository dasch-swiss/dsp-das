import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiResponseError } from '@dasch-swiss/dsp-js';
import { HttpStatusMsg } from 'src/assets/http/statusMsg';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(
        private _snackBar: MatSnackBar,
        private _statusMsg: HttpStatusMsg
    ) { }

    // todo: maybe we can add more parameters like:
    // action: string = 'x', duration: number = 4200
    // and / or type: 'note' | 'warning' | 'error' | 'success'; which can be used for the panelClass
    openSnackBar(notification: string | ApiResponseError, type?: 'success' | 'error'): void {
        let duration = 5000;
        let message: string;
        let panelClass: string;

        if (notification instanceof ApiResponseError) {
            if (notification.error && !notification.error['message'].startsWith('ajax error')) {
                // the Api response error contains a complex error message from dsp-js-lib
                message = notification.error['message'];
                duration = undefined;
            } else {
                const defaultStatusMsg = this._statusMsg.default;
                message = `${defaultStatusMsg[notification.status].message} (${notification.status}): ${defaultStatusMsg[notification.status].description}`;
            }
            panelClass = type ? type : 'error';
        } else {
            message = notification;
            panelClass = type ? type : 'success';
        }

        this._snackBar.open(message, 'x', {
            duration,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass
        });
    }
}
