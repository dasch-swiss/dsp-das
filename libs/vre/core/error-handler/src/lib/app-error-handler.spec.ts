import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiResponseError } from '@dasch-swiss/dsp-js';
import { AppConfigService } from '@dasch-swiss/vre/core/config';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateService } from '@ngx-translate/core';
import { AjaxError } from 'rxjs/ajax';
import { AppErrorHandler } from './app-error-handler';
import { ErrorReportingService } from './error-reporting.service';
import { UserFeedbackError } from './user-feedback-error';

/**
 * Builds an `ApiResponseError` wrapping an `AjaxError` with the given status and JSON response body —
 * the JS-LIB shape that routes through `handleGenericError` (the only path that reads the 400 body).
 * `AjaxError` reads `status`/`responseType`/`response` off the xhr, so a minimal fake xhr suffices.
 */
function jsLibError(status: number, response: unknown): ApiResponseError {
  const xhr = { status, responseType: 'json', response } as unknown as XMLHttpRequest;
  const ajaxError = new AjaxError('Error', xhr, {
    url: 'test-url',
    method: 'POST',
    async: true,
    headers: {},
    timeout: 0,
    user: undefined,
    password: undefined,
    crossDomain: false,
    responseType: 'json',
    withCredentials: false,
  });
  return ApiResponseError.fromAjaxError(ajaxError);
}

describe('AppErrorHandler', () => {
  let handler: AppErrorHandler;
  let openSnackBar: jest.Mock;
  let instant: jest.Mock;
  let report: jest.Mock;

  beforeEach(() => {
    openSnackBar = jest.fn();
    report = jest.fn();
    // Echo the key back so assertions can distinguish "showed a translated fallback" from "showed the API reason".
    instant = jest.fn((key: string) => key);

    TestBed.configureTestingModule({
      providers: [
        AppErrorHandler,
        { provide: NotificationService, useValue: { openSnackBar } },
        { provide: TranslateService, useValue: { instant } },
        { provide: AppConfigService, useValue: { dspInstrumentationConfig: { environment: 'dev' } } },
        { provide: ErrorReportingService, useValue: { report } },
        // NgZone is the real one from the zone test env; its run() executes synchronously, so the
        // snackbar call inside displayNotification is observable in the assertions.
      ],
    });

    handler = TestBed.inject(AppErrorHandler);
  });

  describe('400 error body (JS-LIB path via handleGenericError)', () => {
    it('surfaces the message from the older knora-api:error shape', () => {
      handler.handleError(
        jsLibError(400, { 'knora-api:error': 'dsp.errors.BadRequestException: the label is required' })
      );

      // The capture group is everything after the colon, verbatim — the code does not trim, so the
      // leading space from "BadRequestException: " is preserved.
      expect(openSnackBar).toHaveBeenCalledWith(' the label is required', 'error');
    });

    it('surfaces the message from the newer { message } shape', () => {
      handler.handleError(jsLibError(400, { message: 'value type is not supported' }));

      expect(openSnackBar).toHaveBeenCalledWith('value type is not supported', 'error');
    });

    it('prefers the parsed knora-api:error reason over a { message } when both are present', () => {
      handler.handleError(
        jsLibError(400, {
          'knora-api:error': 'dsp.errors.BadRequestException: precise reason',
          message: 'generic message',
        })
      );

      expect(openSnackBar).toHaveBeenCalledWith(' precise reason', 'error');
    });

    it('is null-safe: a knora-api:error that does not match the regex is shown verbatim (does not throw)', () => {
      handler.handleError(jsLibError(400, { 'knora-api:error': 'some unstructured error text' }));

      expect(openSnackBar).toHaveBeenCalledWith('some unstructured error text', 'error');
    });

    it('falls back to the contact-support message when the 400 body carries no reason', () => {
      handler.handleError(jsLibError(400, {}));

      expect(instant).toHaveBeenCalledWith('core.errorHandler.contactSupport');
      expect(openSnackBar).toHaveBeenCalledWith('core.errorHandler.contactSupport', 'error');
    });
  });

  /**
   * Telemetry used to be reached from the final `else` only, so the three branches that show a
   * snackbar reported nothing: no ApiResponseError and no HttpErrorResponse had ever arrived in
   * Sentry, and a snackbar is gone after five seconds (DEV-6872). Every branch must report, and
   * notifying the user must not be the condition for it.
   */
  describe('telemetry reporting (DEV-6872)', () => {
    it('reports an ApiResponseError and still shows the snackbar', () => {
      const error = jsLibError(504, {});

      handler.handleError(error);

      expect(report).toHaveBeenCalledWith(error);
      expect(openSnackBar).toHaveBeenCalledWith('core.errorHandler.timeout', 'error');
    });

    it('reports an HttpErrorResponse and still shows the snackbar', () => {
      const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error', url: '/v2/resources/xyz' });

      handler.handleError(error);

      expect(report).toHaveBeenCalledWith(error);
      expect(openSnackBar).toHaveBeenCalledWith('core.errorHandler.contactSupport', 'error');
    });

    it('reports a UserFeedbackError and still shows its message', () => {
      const error = new UserFeedbackError('the project has no ontology');

      handler.handleError(error);

      expect(report).toHaveBeenCalledWith(error);
      expect(openSnackBar).toHaveBeenCalledWith('the project has no ontology', 'error');
    });

    it('reports an error of no recognised kind, as it always did', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const error = new Error('cannot read properties of undefined');

      handler.handleError(error);

      expect(report).toHaveBeenCalledWith(error);
      expect(openSnackBar).not.toHaveBeenCalled();
    });
  });
});
