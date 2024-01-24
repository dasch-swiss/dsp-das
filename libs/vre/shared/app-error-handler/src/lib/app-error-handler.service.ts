import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, ErrorHandler } from '@angular/core';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';

@Injectable({
  providedIn: 'root',
})
export class AppErrorHandler implements ErrorHandler {
  constructor(private _notification: NotificationService) {}
  handleError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    let message: string;

    if (error.message.includes('knora.json: 0 Unknown Error')) {
      message = 'IIIF server error: The image could not be loaded. Please try again later.';
    } else if (error.status === 404) {
      message = 'The requested resource was not found.';
    } else if (error.status === 504) {
      message = `There was a timeout issue with one or several requests.
            The resource(s) or a part of it cannot be displayed correctly.
            Failed on ${error.url}`;
    } else {
      message = 'There is an error on our side. Our team is notified!';
    }

    this._notification.openSnackBar(message, 'error');
  }
}
