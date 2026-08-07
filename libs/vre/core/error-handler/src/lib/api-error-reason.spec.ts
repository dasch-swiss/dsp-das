import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponseError } from '@dasch-swiss/dsp-js';
import { AjaxError } from 'rxjs/ajax';
import { reasonFromApiError, reasonFromErrorBody, userFacingReason } from './api-error-reason';

const makeApiResponseError = (status: number, response: unknown): ApiResponseError => {
  const ajax = Object.create(AjaxError.prototype) as AjaxError;
  Object.assign(ajax, { status, response, message: `ajax error ${status}`, name: 'AjaxError' });
  const error = Object.create(ApiResponseError.prototype) as ApiResponseError;
  Object.assign(error, { status, error: ajax, url: '/v2/search/x', method: 'GET' });
  return error;
};

describe('reasonFromErrorBody', () => {
  it.each([
    ['a bare string body', 'plain failure', 'plain failure'],
    ['an empty string body', '', undefined],
    ['a JSON-LD knora-api:error', { 'knora-api:error': 'jsonld reason' }, 'jsonld reason'],
    ['an OpenAPI { message }', { message: 'openapi reason' }, 'openapi reason'],
    ['an { error } body', { error: 'error-field reason' }, 'error-field reason'],
    ['a body with no reason', { unrelated: 1 }, undefined],
    ['a null body', null, undefined],
  ])('reads %s', (_label, body, expected) => {
    expect(reasonFromErrorBody(body)).toBe(expected);
  });
});

describe('reasonFromApiError', () => {
  it('reads through an ApiResponseError to the wrapped AjaxError body', () => {
    expect(reasonFromApiError(makeApiResponseError(400, { message: 'wrapped reason' }))).toBe('wrapped reason');
  });

  it('reads an HttpErrorResponse body', () => {
    const error = new HttpErrorResponse({ status: 409, error: { message: 'conflict reason' } });
    expect(reasonFromApiError(error)).toBe('conflict reason');
  });

  it('returns undefined for anything that is not an API failure', () => {
    expect(reasonFromApiError(new Error('boom'))).toBeUndefined();
  });
});

describe('userFacingReason', () => {
  it('surfaces the reason dsp-api gives for a rejected query (DEV-6866)', () => {
    // The real body from GET /v2/search/de* — the case that was reported as an eternal spinner.
    const error = makeApiResponseError(400, {
      message:
        'A wildcard search term must contain at least 3 characters besides the wildcard, but the following do not: de*.',
    });

    expect(userFacingReason(error)).toBe(
      'A wildcard search term must contain at least 3 characters besides the wildcard, but the following do not: de*.'
    );
  });

  it('strips the dsp exception class the older v2 shape prefixes', () => {
    const error = makeApiResponseError(400, {
      'knora-api:error': 'dsp.errors.BadRequestException: the query is malformed',
    });

    expect(userFacingReason(error)).toBe('the query is malformed');
  });

  it('surfaces a 409 conflict reason', () => {
    const error = new HttpErrorResponse({ status: 409, error: { message: 'shortname already taken' } });

    expect(userFacingReason(error)).toBe('shortname already taken');
  });

  it.each([500, 502, 504, 403, 404])(
    'withholds the body of a %i, which carries internals rather than an explanation',
    status => {
      const error = makeApiResponseError(status, { message: 'NullPointerException at internal.Service:42' });

      // Callers fall back to their own curated wording, matching what the snackbar shows.
      expect(userFacingReason(error)).toBeUndefined();
    }
  );

  it('returns undefined when a reason-bearing status carries no reason', () => {
    expect(userFacingReason(makeApiResponseError(400, {}))).toBeUndefined();
  });
});
