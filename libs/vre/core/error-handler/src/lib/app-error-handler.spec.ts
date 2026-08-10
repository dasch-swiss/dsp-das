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
   * The `HttpErrorResponse` path used to test the body against three shapes in turn, so the JSON-LD
   * `{ 'knora-api:error': … }` of the hand-written v2 services matched none of them and the branch
   * returned having notified nobody: the user caused a 400 and saw nothing (DEV-6922). All four shapes
   * now go through the precedence `reasonFromErrorBody` already shares with telemetry.
   */
  describe('400 error body (ApiServices path via handleHttpErrorResponse)', () => {
    const badRequest = (body: unknown) =>
      new HttpErrorResponse({ status: 400, statusText: 'Bad Request', error: body });

    it('surfaces the knora-api:error of the hand-written JSON-LD v2 services (DEV-6922)', () => {
      handler.handleError(badRequest({ 'knora-api:error': 'dsp.errors.BadRequestException: the label is required' }));

      // Everything after the colon, verbatim: the capture group is not trimmed, exactly as the
      // `{ error }` shape beside it has always shown it.
      expect(openSnackBar).toHaveBeenCalledWith(' the label is required', 'error');
    });

    it('surfaces a knora-api:error that carries no exception class verbatim', () => {
      handler.handleError(badRequest({ 'knora-api:error': 'the resource is already deleted' }));

      expect(openSnackBar).toHaveBeenCalledWith('the resource is already deleted', 'error');
    });

    it('prefers the knora-api:error over a { message } beside it, as telemetry and the JS-LIB path do', () => {
      handler.handleError(
        badRequest({ 'knora-api:error': 'dsp.errors.BadRequestException: precise reason', message: 'generic message' })
      );

      expect(openSnackBar).toHaveBeenCalledWith(' precise reason', 'error');
    });

    it.each([
      [
        'an { error } carrying a dsp exception',
        { error: 'dsp.errors.BadRequestException: the label is required' },
        ' the label is required',
      ],
      [
        'the parenthesised detail of an invalid request',
        { error: 'Invalid request (the label must not be empty)' },
        'the label must not be empty',
      ],
      [
        'the detail out of a bare string body',
        'Invalid request (the label must not be empty)',
        'the label must not be empty',
      ],
      ['a declared { message } whole', { message: 'value type is not supported' }, 'value type is not supported'],
    ])('keeps showing %s', (_label, body, expected) => {
      handler.handleError(badRequest(body));

      expect(openSnackBar).toHaveBeenCalledWith(expected, 'error');
    });

    it('shows a declared { message } whole even when it ends in a parenthesis', () => {
      // The parenthesis extraction belongs to dsp-api's raw exception text. A `{ message }` is a
      // sentence written for the user, so extracting from it would drop everything before the clause.
      handler.handleError(badRequest({ message: 'The value is invalid (an integer was expected)' }));

      expect(openSnackBar).toHaveBeenCalledWith('The value is invalid (an integer was expected)', 'error');
    });

    it('keeps the sentence behind the exception class rather than the parenthesis it ends with', () => {
      // A real dsp-api 400 (SearchResponderV2): the parenthesis holds Lucene's parse failure, the text
      // before it names what the user got wrong. Taking the parenthesis first — which is what the two
      // extractions used to add up to, the later call replacing the earlier bar — left the user holding
      // internals that `userFacingReason` withholds from the failure panel outright (DEV-6866).
      handler.handleError(
        badRequest({
          'knora-api:error':
            "dsp.errors.BadRequestException: Invalid search string: 'de*' (org.apache.lucene.queryparser.classic.ParseException: Cannot parse 'de*')",
        })
      );

      expect(openSnackBar).toHaveBeenCalledTimes(1);
      expect(openSnackBar).toHaveBeenCalledWith(
        " Invalid search string: 'de*' (org.apache.lucene.queryparser.classic.ParseException: Cannot parse 'de*')",
        'error'
      );
    });

    it('says nothing when the body is a page rather than a message', () => {
      // Angular assigns the raw text when an error body does not parse as JSON, so a 400 from a proxy
      // ahead of the API arrives as a whole HTML page. MatSnackBar would show all of it, escaped.
      handler.handleError(
        badRequest('<html>\r\n<head><title>400 Request Header Or Cookie Too Large</title></head>\r\n</html>\r\n')
      );

      expect(openSnackBar).not.toHaveBeenCalled();
    });

    it('does not throw on a 400 with an empty body', () => {
      // Angular leaves `error` null when a 400 arrives with no body, as a gateway or proxy answers.
      // There is nothing to tell the user, but throwing here costs them the snackbar for every
      // error and kills the calling component's stream (DEV-6872).
      expect(() => handler.handleError(new HttpErrorResponse({ status: 400 }))).not.toThrow();
      expect(openSnackBar).not.toHaveBeenCalled();
    });

    it('says nothing when a 400 body carries no reason at all', () => {
      handler.handleError(badRequest({ unrelated: 'metadata' }));

      expect(openSnackBar).not.toHaveBeenCalled();
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

    it('still shows the snackbar when reporting itself throws', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      report.mockImplementation(() => {
        throw new TypeError("Cannot read properties of undefined (reading 'report')");
      });

      handler.handleError(new HttpErrorResponse({ status: 500, statusText: 'Server Error' }));

      expect(openSnackBar).toHaveBeenCalledWith('core.errorHandler.contactSupport', 'error');
      expect(consoleError).toHaveBeenCalled();
    });
  });

  /**
   * A 409 used to read `response['knora-api:error']` unconditionally. Only the JS-LIB `AjaxError`
   * has a `response`; the generated OpenAPI client answers with an `HttpErrorResponse`, so the read
   * threw inside the handler and the user lost the snackbar entirely (DEV-6872).
   */
  describe('409 conflict', () => {
    it('surfaces the { message } of an OpenAPI-declared ConflictException', () => {
      // The shape every 409 in the vendored spec answers with, reaching the handler through the
      // generated client as an HttpErrorResponse.
      handler.handleError(
        new HttpErrorResponse({
          status: 409,
          statusText: 'Conflict',
          error: { message: 'a project with this shortcode already exists' },
        })
      );

      expect(openSnackBar).toHaveBeenCalledWith('a project with this shortcode already exists', 'error');
    });

    it('surfaces the knora-api:error of the hand-written JSON-LD v2 services', () => {
      handler.handleError(
        new HttpErrorResponse({
          status: 409,
          statusText: 'Conflict',
          error: { 'knora-api:error': 'the resource has been modified in the meantime' },
        })
      );

      expect(openSnackBar).toHaveBeenCalledWith('the resource has been modified in the meantime', 'error');
    });

    it('falls back to contact-support when a 409 carries no reason', () => {
      handler.handleError(new HttpErrorResponse({ status: 409, statusText: 'Conflict' }));

      expect(openSnackBar).toHaveBeenCalledWith('core.errorHandler.contactSupport', 'error');
    });

    it('still reads the JS-LIB shape', () => {
      handler.handleError(jsLibError(409, { 'knora-api:error': 'duplicate value' }));

      expect(openSnackBar).toHaveBeenCalledWith('duplicate value', 'error');
    });
  });
});
