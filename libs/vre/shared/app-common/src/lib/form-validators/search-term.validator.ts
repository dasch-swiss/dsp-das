import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * dsp-api rejects a search value shorter than this, whatever the endpoint:
 * "A search value is expected to have at least length of 3".
 */
export const MIN_SEARCH_TERM_LENGTH = 3;

// Two literals on purpose: `.test()` on a `/g` regex advances `lastIndex` between calls and would skip
// tokens, so the predicate uses the non-global one and only `.replace()` uses the global one.
const WILDCARD = /[*?]/;
const WILDCARDS_GLOBAL = /[*?]/g;

/**
 * The whole trimmed term must be at least {@link MIN_SEARCH_TERM_LENGTH} characters. The rule is on the
 * *whole* string, not per token — `buch de` passes even though `de` alone does not.
 *
 * This half holds on every search path (`/v2/search/:term` and Gravsearch `knora-api:matchFulltext`),
 * so it is the validator to reach for by default. An empty control is left to `Validators.required`.
 */
export function searchTermMinLengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const term = (control.value ?? '').trim();
    if (term === '') {
      return null;
    }
    return term.length < MIN_SEARCH_TERM_LENGTH
      ? { searchTermTooShort: { requiredLength: MIN_SEARCH_TERM_LENGTH } }
      : null;
  };
}

/**
 * The rule of the fulltext endpoint (`/v2/search/:term`): the min-length rule above, plus — unlike it —
 * a *per-token* one. Every whitespace-separated token holding a wildcard needs at least
 * {@link MIN_SEARCH_TERM_LENGTH} characters besides its wildcards, so `de*` and `hello de*` are both
 * rejected while `ide*`, `de*x` and `buch de` pass.
 *
 * Measured against the dev API. Do NOT use this on the advanced search bar: its term travels through
 * Gravsearch `matchFulltext`, which accepts `de*` (200) and only enforces the min-length half.
 */
export function fulltextSearchTermValidator(): ValidatorFn {
  const minLength = searchTermMinLengthValidator();

  return (control: AbstractControl): ValidationErrors | null => {
    const tooShort = minLength(control);
    if (tooShort) {
      return tooShort;
    }

    const term = (control.value ?? '').trim();
    const hasShortWildcardToken = term
      .split(/\s+/)
      .filter((token: string) => WILDCARD.test(token))
      .some((token: string) => token.replace(WILDCARDS_GLOBAL, '').length < MIN_SEARCH_TERM_LENGTH);

    return hasShortWildcardToken ? { searchWildcardTooShort: { requiredLength: MIN_SEARCH_TERM_LENGTH } } : null;
  };
}
