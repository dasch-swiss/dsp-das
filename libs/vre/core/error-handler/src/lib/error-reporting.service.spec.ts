import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiResponseError } from '@dasch-swiss/dsp-js';
import { AjaxError } from 'rxjs/ajax';
import { ErrorReportingService } from './error-reporting.service';

/** Mirrors the service's own suppression window; the spec advances the clock past it deliberately. */
const DEDUP_WINDOW_MS = 60_000;

/**
 * Builds the JS-LIB failure shape: an `ApiResponseError` wrapping an `AjaxError`. `ApiResponseError`
 * has a private constructor, so `fromAjaxError` is the only way in — it copies status off the xhr and
 * method/url off the request, which is exactly what the reporting service reads.
 */
function apiError(status: number, method: string, url: string, response: unknown = {}): ApiResponseError {
  const xhr = { status, responseType: 'json', response } as unknown as XMLHttpRequest;
  const ajaxError = new AjaxError('Error', xhr, {
    url,
    method,
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

describe('ErrorReportingService', () => {
  let service: ErrorReportingService;
  let captureException: jest.Mock;
  let pushError: jest.Mock;
  let now: number;

  beforeEach(() => {
    captureException = jest.fn();
    pushError = jest.fn();
    window.Sentry = { captureException } as unknown as typeof window.Sentry;
    window.__FARO__ = { api: { pushError } } as unknown as typeof window.__FARO__;

    // Drive the dedup window off a controllable clock rather than fake timers, which would also patch
    // the zone the Angular test env runs in.
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    TestBed.configureTestingModule({ providers: [ErrorReportingService] });
    service = TestBed.inject(ErrorReportingService);
  });

  afterEach(() => {
    delete window.Sentry;
    delete window.__FARO__;
    jest.restoreAllMocks();
  });

  describe('API failures', () => {
    it('reports an ApiResponseError as a real Error, grouped by method, status and route', () => {
      // The Gravsearch count query dsp-app fires per page: a POST whose query string carries the
      // project IRI. Neither ApiResponseError nor HttpErrorResponse extends Error, so captured raw
      // Sentry files them all as one "Non-Error exception captured with keys: …" issue.
      service.report(
        apiError(
          504,
          'POST',
          'https://api.dasch.swiss/v2/searchextended/count?limitToProject=http%3A%2F%2Frdfh.ch%2Fprojects%2F0001'
        )
      );

      expect(captureException).toHaveBeenCalledTimes(1);
      const [reported, context] = captureException.mock.calls[0];
      expect(reported).toBeInstanceOf(Error);
      // The project IRI is dropped with the rest of the query string, so one endpoint stays one issue.
      expect(reported.message).toBe('dsp-api 504 POST /v2/searchextended/count');
      expect(context.fingerprint).toEqual(['dsp-api', 'POST', '504', '/v2/searchextended/count']);
      expect(context.tags).toMatchObject({
        'dsp.status': '504',
        'dsp.method': 'POST',
        'dsp.route': '/v2/searchextended/count',
      });
    });

    it('reports an HttpErrorResponse, which carries no request method', () => {
      service.report(new HttpErrorResponse({ status: 500, statusText: 'Server Error', url: '/v2/resources/xyz' }));

      const [reported, context] = captureException.mock.calls[0];
      expect(reported.message).toBe('dsp-api 500 UNKNOWN /v2/resources');
      expect(context.fingerprint).toEqual(['dsp-api', 'UNKNOWN', '500', '/v2/resources']);
    });

    it('keeps the full URL off the tags and on the event, so the tag index stays low-cardinality', () => {
      // The fulltext count query does put its search term in the path.
      const url = 'https://api.dasch.swiss/v2/search/count/Wandel%20der%20Zeit?limitToProject=http%3A%2F%2Frdfh.ch';
      service.report(apiError(500, 'GET', url));

      const [, context] = captureException.mock.calls[0];
      expect(context.extra).toEqual({ 'dsp.url': url });
      expect(Object.values(context.tags)).not.toContain(url);
    });

    it('collapses the identifier-bearing tail of a route so one endpoint is one issue', () => {
      // Two different resource IRIs on the same endpoint must not become two Sentry issues.
      service.report(apiError(403, 'GET', '/v2/resources/http%3A%2F%2Frdfh.ch%2F0801%2FaaaaaaaaaaaaaaaaaaaaaA'));
      const first = captureException.mock.calls[0][1].fingerprint;

      now += DEDUP_WINDOW_MS;
      service.report(apiError(403, 'GET', '/v2/resources/http%3A%2F%2Frdfh.ch%2F0801%2FbbbbbbbbbbbbbbbbbbbbbB'));
      const second = captureException.mock.calls[1][1].fingerprint;

      expect(first).toEqual(['dsp-api', 'GET', '403', '/v2/resources']);
      expect(second).toEqual(first);
    });

    it("keeps dsp-api's reason on the event, since the status alone is not actionable", () => {
      // The JSON-LD shape. Without this the issue reads "dsp-api 400 POST /v2/values" and nothing
      // tells you which constraint the API rejected.
      service.report(
        apiError(400, 'POST', '/v2/values', {
          'knora-api:error': 'dsp.errors.BadRequestException: value type is not supported',
        })
      );

      expect(captureException.mock.calls[0][1].extra['dsp.response']).toBe(
        'dsp.errors.BadRequestException: value type is not supported'
      );
    });

    it("keeps an HttpErrorResponse's body reason", () => {
      service.report(
        new HttpErrorResponse({
          status: 400,
          statusText: 'Bad Request',
          url: '/admin/projects',
          error: { message: 'shortcode is already taken' },
        })
      );

      expect(captureException.mock.calls[0][1].extra['dsp.response']).toBe('shortcode is already taken');
    });

    it('omits the reason entirely when the body carries none', () => {
      // Angular's own composed message is not used as a fallback — it restates the status and URL,
      // both already on the event. So a present dsp.response means the server really said something.
      service.report(new HttpErrorResponse({ status: 504, statusText: 'Gateway Timeout', url: '/v2/search/count/x' }));

      expect(captureException.mock.calls[0][1].extra).toEqual({ 'dsp.url': '/v2/search/count/x' });
    });

    it('truncates a long reason', () => {
      service.report(apiError(500, 'POST', '/v2/values', { message: 'x'.repeat(5000) }));

      expect(captureException.mock.calls[0][1].extra['dsp.response']).toHaveLength(2000);
    });

    it('keeps the reason out of the fingerprint, so one endpoint stays one issue', () => {
      service.report(apiError(400, 'POST', '/v2/values', { message: 'the label is required' }));

      expect(captureException.mock.calls[0][1].fingerprint).toEqual(['dsp-api', 'POST', '400', '/v2/values']);
    });

    it('attaches caller context as tags so a silently swallowed failure names its call site', () => {
      service.report(apiError(504, 'GET', '/v2/search/count/gaga'), {
        component: 'SearchResultComponent',
        operation: 'fulltextCountQuery',
      });

      expect(captureException.mock.calls[0][1].tags).toMatchObject({
        component: 'SearchResultComponent',
        operation: 'fulltextCountQuery',
      });
    });
  });

  describe('deduplication', () => {
    it('reports the same failure once within the dedup window', () => {
      const report = () => service.report(apiError(504, 'GET', '/v2/search/count/gaga'));

      report();
      now += DEDUP_WINDOW_MS - 1;
      report();

      // A user hammering retry during a triplestore timeout must not send one event per click.
      expect(captureException).toHaveBeenCalledTimes(1);
    });

    it('reports it again once the window has elapsed', () => {
      service.report(apiError(504, 'GET', '/v2/search/count/gaga'));
      now += DEDUP_WINDOW_MS;
      service.report(apiError(504, 'GET', '/v2/search/count/gaga'));

      expect(captureException).toHaveBeenCalledTimes(2);
    });

    it('does not suppress a different status on the same route', () => {
      service.report(apiError(504, 'GET', '/v2/search/count/gaga'));
      service.report(apiError(500, 'GET', '/v2/search/count/gaga'));

      expect(captureException).toHaveBeenCalledTimes(2);
    });

    it('does not suppress a different reason behind the same fingerprint', () => {
      // Two distinct rejections of the same endpoint are two distinct failures. Keying dedup on the
      // fingerprint alone would report the first and silently discard the second reason.
      service.report(apiError(400, 'POST', '/v2/values', { message: 'the label is required' }));
      service.report(apiError(400, 'POST', '/v2/values', { message: 'value type is not supported' }));

      expect(captureException).toHaveBeenCalledTimes(2);
    });

    it('still suppresses a repeat of the same reason', () => {
      const body = { message: 'the label is required' };
      service.report(apiError(400, 'POST', '/v2/values', body));
      service.report(apiError(400, 'POST', '/v2/values', body));

      expect(captureException).toHaveBeenCalledTimes(1);
    });
  });

  describe('non-API errors', () => {
    it('passes a JS error through untouched, so Sentry groups it by its own stack as before', () => {
      const error = new Error('boom');

      service.report(error);

      const [reported, context] = captureException.mock.calls[0];
      expect(reported).toBe(error);
      expect(context.fingerprint).toBeUndefined();
    });

    it('does not deduplicate JS errors', () => {
      service.report(new Error('boom'));
      service.report(new Error('boom'));

      expect(captureException).toHaveBeenCalledTimes(2);
    });
  });

  describe('transports', () => {
    it('pushes to Faro alongside Sentry', () => {
      service.report(apiError(500, 'POST', '/v2/values/xyz'));

      expect(pushError).toHaveBeenCalledTimes(1);
      const [reported, context] = pushError.mock.calls[0];
      expect(reported).toBeInstanceOf(Error);
      expect(context.context).toMatchObject({ 'dsp.status': '500' });
    });

    it('is a no-op when neither SDK is loaded, which is the normal case locally', () => {
      delete window.Sentry;
      delete window.__FARO__;

      expect(() => service.report(apiError(500, 'GET', '/v2/search/count/gaga'))).not.toThrow();
    });

    it('does not let a failing Sentry transport stop the Faro one', () => {
      captureException.mockImplementation(() => {
        throw new Error('Sentry is down');
      });
      jest.spyOn(console, 'error').mockImplementation(() => undefined);

      service.report(apiError(500, 'GET', '/v2/search/count/gaga'));

      expect(pushError).toHaveBeenCalledTimes(1);
    });
  });
});
