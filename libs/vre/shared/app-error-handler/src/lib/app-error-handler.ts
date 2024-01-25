import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, ErrorHandler } from '@angular/core';
import { ApiResponseError } from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { AjaxError } from 'rxjs/ajax';

@Injectable({
  providedIn: 'root',
})
export class AppErrorHandler implements ErrorHandler {
  constructor(private _notification: NotificationService) {}
  handleError(error: any): void {
    if (error instanceof ApiResponseError && error.error instanceof AjaxError) {
      // JS-LIB
      this.handleHttpError(error.error, error.url);
    } else if (error instanceof HttpErrorResponse) {
      // ApiServices
      this.handleHttpError(error, error.url);
    }
  }

  private handleHttpError(error: HttpErrorResponse | AjaxError, url: string | null): void {
    let message: string;

    if (error.status === 0) {
      message = 'It seems that you are not connected to internet.';
    } else if (error.message.includes('knora.json: 0 Unknown Error')) {
      message = 'IIIF server error: The image could not be loaded. Please try again later.';
    } else if (error.status === 404) {
      message = 'The requested resource was not found.';
    } else if (error.status === 504) {
      message = `There was a timeout issue with one or several requests.
            The resource(s) or a part of it cannot be displayed correctly.
            Failed on ${url}`;
    } else {
      message = 'There is an error on our side. Our team is notified!';
    }

    this._notification.openSnackBar(message, 'error');
  }
}
