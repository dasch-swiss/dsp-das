import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { ApiResponseError } from '@dasch-swiss/dsp-js';
import { AppConfigService } from '@dasch-swiss/vre/core/config';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateService } from '@ngx-translate/core';
import * as Sentry from '@sentry/angular';
import { AjaxError } from 'rxjs/ajax';
import { UserFeedbackError } from './user-feedback-error';

@Injectable({
  providedIn: 'root',
})
export class AppErrorHandler implements ErrorHandler {
  private readonly _translateService = inject(TranslateService);

  constructor(
    private readonly _notification: NotificationService,
    private readonly _appConfig: AppConfigService,
    private readonly _ngZone: NgZone
  ) {}

  badRequestRegexMatch = /dsp\.errors\.BadRequestException:(.*)$/;

  handleError(error: any): void {
    if (error instanceof ApiResponseError && error.error instanceof AjaxError) {
      // JS-LIB
      this.handleGenericError(error.error, error.url);
    } else if (error instanceof HttpErrorResponse) {
      // ApiServices
      this.handleHttpErrorResponse(error);
    } else if (error instanceof UserFeedbackError) {
      this.displayNotification(error.message);
    } else {
      if (this._appConfig.dspInstrumentationConfig.environment !== 'prod') {
        console.error(error);
      }
      this.sendErrorToSentry(error);
    }
  }

  private handleHttpErrorResponse(error: HttpErrorResponse) {
    if (error.status === 400) {
      if (error.error?.error) {
        const badRequestRegexMatch = error.error.error.match(this.badRequestRegexMatch);

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
      message = this._translateService.instant('core.errorHandler.noInternet');
    } else if (error.message.includes('knora.json: 0 Unknown Error')) {
      message = this._translateService.instant('core.errorHandler.iiifServerError');
    } else if (
      error.status === 400 &&
      (error as AjaxError).response['knora-api:error'] &&
      (error as AjaxError).response['knora-api:error'].match(this.badRequestRegexMatch).length > 0
    ) {
      message = (error as AjaxError).response['knora-api:error'].match(this.badRequestRegexMatch)[1];
    } else if (error.status === 403) {
      message = this._translateService.instant('core.errorHandler.noPermission');
    } else if (error.status === 404) {
      message = this._translateService.instant('core.errorHandler.notFound');
    } else if (error.status === 409) {
      message = (error as AjaxError).response['knora-api:error'];
    } else if (error.status === 504) {
      message = this._translateService.instant('core.errorHandler.timeout', { url });
    } else {
      message = this._translateService.instant('core.errorHandler.contactSupport');
    }

    this.displayNotification(message);
  }

  private displayNotification(message: string) {
    // ngZone is needed, as ErrorHandler does not invoke change detection cycle.
    this._ngZone.run(() => {
      this._notification.openSnackBar(message, 'error');
    });
  }

  // TODO ask the backend to uniformize their response, so that this method is only called once.
  private testInvalidRequest(error: string) {
    const invalidRequestRegexMatch = error.match(/\((.*)\)$/);
    if (invalidRequestRegexMatch) {
      this.displayNotification(invalidRequestRegexMatch[1]);
    }
  }

  private sendErrorToSentry(error: any) {
    Sentry.captureException(error);
  }
}
