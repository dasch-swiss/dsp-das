import { FormControl } from '@angular/forms';
import { regexPatternValidator } from './regex-pattern.validator';

describe('regexPatternValidator (DEV-7441)', () => {
  const validator = regexPatternValidator();
  const validate = (value: string | null) => validator(new FormControl(value));

  it.each([null, ''])('leaves an empty value to Validators.required (%p)', value => {
    expect(validate(value)).toBeNull();
  });

  // `*MAL*` is the prod case: a glob wildcard, which dsp-api rejects with "Dangling meta character '*'".
  it.each(['*MAL*', '+foo', 'foo(', 'foo)', '[abc', 'a{2,1}', 'foo\\'])('rejects %p', pattern => {
    expect(validate(pattern)).toEqual({ invalidRegex: true });
  });

  it.each(['.*MAL.*', 'MAL', '^Mal', 'foo|bar', '\\*MAL\\*', '[a-z]+', '(?:ab)+', 'a{2}'])('accepts %p', pattern => {
    expect(validate(pattern)).toBeNull();
  });

  // Valid for java.util.regex but rejected by JavaScript's RegExp: these must not be blocked.
  it.each([
    '(?i)mal',
    '(?-i)Mal',
    '(?i:mal)',
    '(?>ab)c',
    'a*+',
    'a++b',
    'a{2}+',
    '\\Q*MAL*\\E',
    '\\h+',
    '^*',
    'a{2}{3}',
  ])('accepts Java syntax %p', pattern => {
    expect(validate(pattern)).toBeNull();
  });

  // Accepted by JavaScript's RegExp but refused by java.util.regex, so dsp-api would answer with a 400.
  it.each([
    ['{MAL}', 'a brace that is no quantifier'],
    ['a{', 'an unclosed quantifier'],
    ['x{1', 'an unclosed quantifier'],
    ['\\y', 'an escape Java does not know'],
    ['[\\b]', 'an anchor inside a character class'],
    ['\\k<n>', 'a reference to an undefined group'],
  ])('rejects %p: %s', pattern => {
    expect(validate(pattern)).toEqual({ invalidRegex: true });
  });

  // Java-only syntax must not switch the check off for the rest of the pattern.
  it.each(['(?i)*MAL*', 'C++(', '(?P<n>a)'])('rejects %p despite its Java-only syntax', pattern => {
    expect(validate(pattern)).toEqual({ invalidRegex: true });
  });

  // Comments mode ignores whitespace and `#…` for the rest of the pattern, so it is not checked here.
  it('leaves a comments-mode pattern to dsp-api', () => {
    expect(validate('(?x) M a l  # a spaced-out name')).toBeNull();
  });
});
