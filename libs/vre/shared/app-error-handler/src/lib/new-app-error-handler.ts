import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, ErrorHandler } from '@angular/core';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';

@Injectable({
  providedIn: 'root',
})
export class NewAppErrorHandler implements ErrorHandler {
  constructor(private _notification: NotificationService) {}
  handleError(error: any): void {
    console.log('catch error', error);
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this._notification.openSnackBar('The requested resource was not found.');
    } else if (error.status >= 500 && error.status < 600) {
      this._notification.openSnackBar('There is an error on our side. Our team is on it!');
    }
  }
}
