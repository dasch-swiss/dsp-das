import { ReadFileValue } from '@dasch-swiss/dsp-js';
import {
  isPlaceholderFileValue,
  isPlaceholderLegalValue,
  PLACEHOLDER_FILE_SENTINEL,
} from './is-placeholder-file-value';

describe('isPlaceholderFileValue', () => {
  const fileValueWith = (filename: string): ReadFileValue => ({ filename }) as ReadFileValue;

  it('returns true when the filename is the placeholder sentinel', () => {
    expect(isPlaceholderFileValue(fileValueWith(PLACEHOLDER_FILE_SENTINEL))).toBe(true);
  });

  it('returns false for a regular filename', () => {
    expect(isPlaceholderFileValue(fileValueWith('abc123.jp2'))).toBe(false);
  });

  it('returns false when the filename merely contains the sentinel as a substring', () => {
    expect(isPlaceholderFileValue(fileValueWith(`${PLACEHOLDER_FILE_SENTINEL}.jp2`))).toBe(false);
  });

  it('returns false for null or undefined', () => {
    expect(isPlaceholderFileValue(null)).toBe(false);
    expect(isPlaceholderFileValue(undefined)).toBe(false);
  });
});

describe('isPlaceholderLegalValue', () => {
  it('returns true for the placeholder sentinel', () => {
    expect(isPlaceholderLegalValue(PLACEHOLDER_FILE_SENTINEL)).toBe(true);
  });

  it('returns false for a real copyright holder, author or license IRI', () => {
    expect(isPlaceholderLegalValue('University of Basel')).toBe(false);
    expect(isPlaceholderLegalValue('http://rdfh.ch/licenses/cc-by-4.0')).toBe(false);
  });

  it('returns false when the value merely contains the sentinel as a substring', () => {
    expect(isPlaceholderLegalValue(`${PLACEHOLDER_FILE_SENTINEL} (pending)`)).toBe(false);
  });

  it('returns false for null, undefined or an empty string', () => {
    expect(isPlaceholderLegalValue(null)).toBe(false);
    expect(isPlaceholderLegalValue(undefined)).toBe(false);
    expect(isPlaceholderLegalValue('')).toBe(false);
  });
});
