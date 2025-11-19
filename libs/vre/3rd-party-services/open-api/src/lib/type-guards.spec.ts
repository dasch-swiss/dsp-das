import { StringLiteralV2 } from '../generated';
import {
  StringLiteralWithLanguage,
  filterWithLanguage,
  ensureLanguageTaggedLiterals,
  ensureWithDefaultLanguage,
} from './type-guards';

describe('Type Guards', () => {
  describe('StringLiteralWithLanguage', () => {
    it('should define interface with value and language', () => {
      const literal: StringLiteralWithLanguage = {
        value: 'test',
        language: 'en',
      };

      expect(literal.value).toBe('test');
      expect(literal.language).toBe('en');
    });
  });

  describe('filterWithLanguage', () => {
    it('should filter items with language tags', () => {
      const items: StringLiteralV2[] = [
        { value: 'Hello', language: 'en' },
        { value: 'Bonjour', language: 'fr' },
        { value: 'Plain text' }, // PlainStringLiteralV2
      ];

      const result = filterWithLanguage(items);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ value: 'Hello', language: 'en' });
      expect(result[1]).toEqual({ value: 'Bonjour', language: 'fr' });
    });

    it('should return empty array when no items have language', () => {
      const items: StringLiteralV2[] = [{ value: 'Plain text 1' }, { value: 'Plain text 2' }];

      const result = filterWithLanguage(items);

      expect(result).toHaveLength(0);
    });

    it('should return all items when all have language', () => {
      const items: StringLiteralV2[] = [
        { value: 'Hello', language: 'en' },
        { value: 'Bonjour', language: 'fr' },
        { value: 'Hallo', language: 'de' },
      ];

      const result = filterWithLanguage(items);

      expect(result).toHaveLength(3);
    });

    it('should filter out items with empty language string', () => {
      const items: StringLiteralV2[] = [
        { value: 'Hello', language: 'en' },
        { value: 'Empty lang', language: '' },
        { value: 'Plain' },
      ];

      const result = filterWithLanguage(items);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ value: 'Hello', language: 'en' });
    });

    it('should handle empty array', () => {
      const items: StringLiteralV2[] = [];

      const result = filterWithLanguage(items);

      expect(result).toHaveLength(0);
    });
  });

  describe('ensureLanguageTaggedLiterals', () => {
    it('should filter unknown array to valid language-tagged literals', () => {
      const items = [
        { value: 'Hello', language: 'en' },
        { value: 'Bonjour', language: 'fr' },
        { value: 'Plain text' }, // No language
        { foo: 'bar' }, // Invalid structure
        'string', // Not an object
        null, // Null value
        undefined, // Undefined value
      ];

      const result = ensureLanguageTaggedLiterals(items);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ value: 'Hello', language: 'en' });
      expect(result[1]).toEqual({ value: 'Bonjour', language: 'fr' });
    });

    it('should filter out objects without value property', () => {
      const items = [
        { value: 'Hello', language: 'en' },
        { language: 'fr' }, // Missing value
        { foo: 'bar', language: 'de' }, // Missing value
      ];

      const result = ensureLanguageTaggedLiterals(items);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ value: 'Hello', language: 'en' });
    });

    it('should filter out objects without language property', () => {
      const items = [
        { value: 'Hello', language: 'en' },
        { value: 'Plain' }, // Missing language
        { value: 'Another', foo: 'bar' }, // Missing language
      ];

      const result = ensureLanguageTaggedLiterals(items);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ value: 'Hello', language: 'en' });
    });

    it('should filter out objects with empty language string', () => {
      const items = [{ value: 'Hello', language: 'en' }, { value: 'Empty', language: '' }, { value: 'Plain' }];

      const result = ensureLanguageTaggedLiterals(items);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ value: 'Hello', language: 'en' });
    });

    it('should filter out objects with non-string language', () => {
      const items = [
        { value: 'Hello', language: 'en' },
        { value: 'Number lang', language: 123 },
        { value: 'Null lang', language: null },
        { value: 'Undefined lang', language: undefined },
      ];

      const result = ensureLanguageTaggedLiterals(items);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ value: 'Hello', language: 'en' });
    });

    it('should filter out objects with non-string value', () => {
      const items = [
        { value: 'Hello', language: 'en' },
        { value: 123, language: 'fr' },
        { value: null, language: 'de' },
      ];

      const result = ensureLanguageTaggedLiterals(items);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ value: 'Hello', language: 'en' });
    });

    it('should handle edge cases', () => {
      const items = [{ value: 'Valid', language: 'en' }, null, undefined, 'string', 123, true, [], {}];

      const result = ensureLanguageTaggedLiterals(items);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ value: 'Valid', language: 'en' });
    });

    it('should return empty array for empty input', () => {
      const result = ensureLanguageTaggedLiterals([]);

      expect(result).toHaveLength(0);
    });

    it('should work with DSP-JS StringLiteral format', () => {
      // DSP-JS format uses optional language
      const dspJsItems = [
        { '@value': 'ignored', value: 'Hello', language: 'en' },
        { value: 'Bonjour', language: 'fr' },
        { value: 'Plain' }, // Optional language
      ];

      const result = ensureLanguageTaggedLiterals(dspJsItems);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          value: 'Hello',
          language: 'en',
        })
      );
    });

    it('should preserve additional properties', () => {
      const items = [{ value: 'Hello', language: 'en', extraProp: 'extra' }];

      const result = ensureLanguageTaggedLiterals(items);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        value: 'Hello',
        language: 'en',
      });
      // Additional properties may or may not be preserved (not guaranteed)
    });
  });

  describe('ensureWithDefaultLanguage', () => {
    it('should preserve items with language tags', () => {
      const items: StringLiteralV2[] = [
        { value: 'Hello', language: 'en' },
        { value: 'Bonjour', language: 'fr' },
      ];

      const result = ensureWithDefaultLanguage(items);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ value: 'Hello', language: 'en' });
      expect(result[1]).toEqual({ value: 'Bonjour', language: 'fr' });
    });

    it('should assign default language to plain items', () => {
      const items: StringLiteralV2[] = [
        { value: 'Hello', language: 'en' },
        { value: 'Plain text' }, // PlainStringLiteralV2
      ];

      const result = ensureWithDefaultLanguage(items);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ value: 'Hello', language: 'en' });
      expect(result[1]).toEqual({ value: 'Plain text', language: 'en' });
    });

    it('should use custom default language', () => {
      const items: StringLiteralV2[] = [{ value: 'Plain text' }, { value: 'Another plain' }];

      const result = ensureWithDefaultLanguage(items, 'de');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ value: 'Plain text', language: 'de' });
      expect(result[1]).toEqual({ value: 'Another plain', language: 'de' });
    });

    it('should filter out items with empty language string', () => {
      const items: StringLiteralV2[] = [
        { value: 'Hello', language: 'en' },
        { value: 'Empty lang', language: '' },
      ];

      const result = ensureWithDefaultLanguage(items);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ value: 'Hello', language: 'en' });
      expect(result[1]).toEqual({ value: 'Empty lang', language: 'en' });
    });

    it('should handle empty array', () => {
      const result = ensureWithDefaultLanguage([]);

      expect(result).toHaveLength(0);
    });

    it('should prevent data loss for mixed items', () => {
      const items: StringLiteralV2[] = [
        { value: 'Tagged 1', language: 'en' },
        { value: 'Plain 1' },
        { value: 'Tagged 2', language: 'fr' },
        { value: 'Plain 2' },
      ];

      const result = ensureWithDefaultLanguage(items, 'de');

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ value: 'Tagged 1', language: 'en' });
      expect(result[1]).toEqual({ value: 'Plain 1', language: 'de' });
      expect(result[2]).toEqual({ value: 'Tagged 2', language: 'fr' });
      expect(result[3]).toEqual({ value: 'Plain 2', language: 'de' });
    });
  });

  describe('Type compatibility', () => {
    it('should be compatible with LanguageTaggedStringLiteralV2', () => {
      const literal: StringLiteralWithLanguage = {
        value: 'test',
        language: 'en',
      };

      // This should compile without errors
      const value: string = literal.value;
      const language: string = literal.language;

      expect(value).toBe('test');
      expect(language).toBe('en');
    });

    it('should work with StringLiteralV2 union type', () => {
      const items: StringLiteralV2[] = [
        { value: 'Tagged', language: 'en' }, // LanguageTaggedStringLiteralV2
        { value: 'Plain' }, // PlainStringLiteralV2
      ];

      const filtered = filterWithLanguage(items);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].language).toBe('en');
    });
  });
});
