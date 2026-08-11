import { FormControl } from '@angular/forms';
import { fulltextSearchTermValidator, searchTermMinLengthValidator } from './search-term.validator';

describe('searchTermMinLengthValidator', () => {
  const validator = searchTermMinLengthValidator();
  const validate = (value: string | null) => validator(new FormControl(value));

  it.each([null, '', '   '])('leaves an empty value to Validators.required (%p)', value => {
    expect(validate(value)).toBeNull();
  });

  // Measured against the dev API: rejected on both /v2/search/:term and Gravsearch matchFulltext.
  it.each(['de', 'a', '*', '**', ' de '])('rejects %p as shorter than three characters', term => {
    expect(validate(term)).toEqual({ searchTermTooShort: { requiredLength: 3 } });
  });

  // The min-length rule is on the whole string, not per token.
  it.each(['ide', 'buch de', 'de*'])('accepts %p', term => {
    expect(validate(term)).toBeNull();
  });

  it('does not apply the per-token wildcard rule — that is the fulltext endpoint only', () => {
    expect(validate('hello de*')).toBeNull();
    expect(validate('*de')).toBeNull();
  });
});

describe('fulltextSearchTermValidator', () => {
  const validator = fulltextSearchTermValidator();
  const validate = (value: string | null) => validator(new FormControl(value));

  it.each([null, '', '   '])('leaves an empty value to Validators.required (%p)', value => {
    expect(validate(value)).toBeNull();
  });

  it.each(['de', 'a', '*', '**'])('rejects %p as shorter than three characters', term => {
    expect(validate(term)).toEqual({ searchTermTooShort: { requiredLength: 3 } });
  });

  it.each(['de*', 'id*', '*de', '***'])('rejects %p for wildcarding too few characters', term => {
    expect(validate(term)).toEqual({ searchWildcardTooShort: { requiredLength: 3 } });
  });

  it('applies the wildcard rule per token, so one bad token rejects the whole term', () => {
    expect(validate('hello de*')).toEqual({ searchWildcardTooShort: { requiredLength: 3 } });
    expect(validate('ide* de*')).toEqual({ searchWildcardTooShort: { requiredLength: 3 } });
  });

  it.each(['ide*', 'de*x', 'abcd*', '*abc', 'buch de', 'hello ide*', 'ide* abcd*'])('accepts %p', term => {
    expect(validate(term)).toBeNull();
  });

  it('counts every wildcard out of a token, not just one', () => {
    expect(validate('d*e*')).toEqual({ searchWildcardTooShort: { requiredLength: 3 } });
    expect(validate('a?b?c')).toBeNull();
  });

  // Inside quotes a `*` is a literal, so the endpoint answers `"a b*"` with a 200 while refusing the
  // same characters unquoted. Splitting the phrase on its space would make `b*"` a term of its own.
  it.each(['"a b*"', '"de*"', '"down the rabbit*"'])('keeps the quoted phrase %p whole', term => {
    expect(validate(term)).toBeNull();
  });

  it('still refuses a short wildcard term standing outside a phrase', () => {
    expect(validate('"a b*" de*')).toEqual({ searchWildcardTooShort: { requiredLength: 3 } });
  });
});
