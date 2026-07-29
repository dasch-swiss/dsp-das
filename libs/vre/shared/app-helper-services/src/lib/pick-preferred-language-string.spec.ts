import { pickPreferredLanguageString } from './pick-preferred-language-string';

describe('pickPreferredLanguageString', () => {
  it('returns the preferred-language value when present and non-empty', () => {
    const labels = [
      { language: 'de', value: 'Dokumentation' },
      { language: 'en', value: 'Documentation' },
    ];
    expect(pickPreferredLanguageString(labels, 'en')).toBe('Documentation');
  });

  it('falls back through the fixed chain (en first) when preferred language is missing', () => {
    const labels = [
      { language: 'de', value: 'Dokumentation' },
      { language: 'en', value: 'Documentation' },
    ];
    expect(pickPreferredLanguageString(labels, 'fr')).toBe('Documentation');
  });

  it('falls back through the chain when preferred value is empty', () => {
    const labels = [
      { language: 'en', value: '' },
      { language: 'de', value: 'Dokumentation' },
    ];
    expect(pickPreferredLanguageString(labels, 'en')).toBe('Dokumentation');
  });

  it('falls back through the chain when preferred value is whitespace-only', () => {
    const labels = [
      { language: 'en', value: '   ' },
      { language: 'de', value: 'Dokumentation' },
    ];
    expect(pickPreferredLanguageString(labels, 'en')).toBe('Dokumentation');
  });

  it('returns empty string for null, undefined, or empty input', () => {
    expect(pickPreferredLanguageString(null, 'en')).toBe('');
    expect(pickPreferredLanguageString(undefined, 'en')).toBe('');
    expect(pickPreferredLanguageString([], 'en')).toBe('');
  });

  describe('deterministic fallback chain (en > de > fr > it > rm)', () => {
    it('falls back to en before any other language when preferred is missing', () => {
      const labels = [
        { language: 'it', value: 'Italiano' },
        { language: 'fr', value: 'Français' },
        { language: 'en', value: 'English' },
        { language: 'de', value: 'Deutsch' },
      ];
      expect(pickPreferredLanguageString(labels, 'rm')).toBe('English');
    });

    it('falls back to de when preferred is missing and en is absent', () => {
      const labels = [
        { language: 'it', value: 'Italiano' },
        { language: 'fr', value: 'Français' },
        { language: 'de', value: 'Deutsch' },
      ];
      expect(pickPreferredLanguageString(labels, 'rm')).toBe('Deutsch');
    });

    it('falls back to fr when preferred is missing and en/de are absent', () => {
      const labels = [
        { language: 'it', value: 'Italiano' },
        { language: 'fr', value: 'Français' },
      ];
      expect(pickPreferredLanguageString(labels, 'rm')).toBe('Français');
    });

    it('falls back to it when only it and rm are present', () => {
      const labels = [
        { language: 'rm', value: 'Rumantsch' },
        { language: 'it', value: 'Italiano' },
      ];
      expect(pickPreferredLanguageString(labels, 'en')).toBe('Italiano');
    });

    it('falls back to rm when it is the only available language', () => {
      const labels = [{ language: 'rm', value: 'Rumantsch' }];
      expect(pickPreferredLanguageString(labels, 'en')).toBe('Rumantsch');
    });

    it('resolves the same string regardless of input array order', () => {
      const orderA = [
        { language: 'it', value: 'Italiano' },
        { language: 'fr', value: 'Français' },
        { language: 'en', value: 'English' },
        { language: 'de', value: 'Deutsch' },
      ];
      const orderB = [
        { language: 'de', value: 'Deutsch' },
        { language: 'en', value: 'English' },
        { language: 'fr', value: 'Français' },
        { language: 'it', value: 'Italiano' },
      ];
      expect(pickPreferredLanguageString(orderA, 'rm')).toBe(pickPreferredLanguageString(orderB, 'rm'));
    });

    it('skips whitespace-only chain entries and continues down the fallback order', () => {
      const labels = [
        { language: 'en', value: '   ' },
        { language: 'de', value: 'Deutsch' },
      ];
      expect(pickPreferredLanguageString(labels, 'rm')).toBe('Deutsch');
    });

    it('falls back to untagged labels (language: "") when the chain misses', () => {
      // `search-by-label` results, ListNodeV2, and other endpoints that expose a
      // single label with no language tag rely on this safety net.
      const labels = [{ language: '', value: 'Book' }];
      expect(pickPreferredLanguageString(labels, 'en')).toBe('Book');
    });

    it('prefers a chain-language label over an untagged one', () => {
      const labels = [
        { language: '', value: 'Untagged' },
        { language: 'de', value: 'Deutsch' },
      ];
      expect(pickPreferredLanguageString(labels, 'rm')).toBe('Deutsch');
    });
  });
});
