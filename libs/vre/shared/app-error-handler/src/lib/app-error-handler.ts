import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { ApiResponseError } from '@dasch-swiss/dsp-js';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { AjaxError } from 'rxjs/ajax';
import { AppError } from './app-error';

@Injectable({
  providedIn: 'root',
})
export class AppErrorHandler implements ErrorHandler {
  constructor(
    private _notification: NotificationService,
    private readonly _appConfig: AppConfigService
  ) {}

  handleError(error: any): void {
    if (error instanceof ApiResponseError && error.error instanceof AjaxError) {
      // JS-LIB
      this.handleGenericError(error.error, error.url);
    } else if (error instanceof HttpErrorResponse) {
      // ApiServices
      this.handleHttpErrorResponse(error);
    } else if (error instanceof AppError) {
      this.displayNotification(error.message);
    } else if (this._appConfig.dspInstrumentationConfig.environment !== 'prod') {
      console.error(error);
    }
  }

  private handleHttpErrorResponse(error: HttpErrorResponse) {
    if (error.status === 400) {
      if (error.error?.error) {
        const badRequestRegexMatch = error.error.error.match(/dsp\.errors\.BadRequestException:(.*)$/);

        if (badRequestRegexMatch) {
          this.displayNotification(badRequestRegexMatch[1]);
        }

        this.testInvalidRequest(error.error.error);
      } else if (typeof error.error === 'string') {
        this.testInvalidRequest(error.error);
      } else if (error.error.message) {
        this.displayNotification(error.error.message);
      }
      return;
    }

    this.handleGenericError(error, error.url);
  }

  private handleGenericError(error: HttpErrorResponse | AjaxError, url: string | null): void {
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

    this.displayNotification(message);
  }

  private displayNotification(message: string) {
    this._notification.openSnackBar(message, 'error');
  }

  // TODO ask the backend to uniformize their response, so that this method is only called once.
  private testInvalidRequest(error: string) {
    const invalidRequestRegexMatch = error.match(/\((.*)\)$/);
    if (invalidRequestRegexMatch) {
      this.displayNotification(invalidRequestRegexMatch[1]);
    }
  }
}
