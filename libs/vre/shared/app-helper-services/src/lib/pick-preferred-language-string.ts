import { StringLiteral, StringLiteralV2 } from '@dasch-swiss/dsp-js';
import { LanguageStringDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AvailableLanguage } from '@dasch-swiss/vre/core/config';

/**
 * Deterministic fallback order for data-side labels when the preferred
 * language is absent. Independent of the current UI language so the same
 * label resolves to the same string across endpoints and users.
 * See DEV-6875.
 */
const DATA_LANGUAGE_FALLBACK_ORDER: readonly AvailableLanguage[] = ['en', 'de', 'fr', 'it', 'rm'];

/**
 * Pick the displayable label for the preferred language with fallback.
 * Returns the label in `language` if non-empty; otherwise walks the fixed
 * fallback chain (`en > de > fr > it > rm`) and returns the first non-empty
 * label found; otherwise an empty string.
 *
 * The fixed chain guarantees the same label wins across API endpoints
 * regardless of the order they return language variants in. The chain
 * covers every language the dsp-api model exposes — no other tags reach
 * this function.
 *
 * Shared between `StringifyStringLiteralPipe` (display) and any
 * call site that needs the same string for sort-key consistency.
 */
export function pickPreferredLanguageString(
  value: ReadonlyArray<StringLiteral | StringLiteralV2 | LanguageStringDto> | null | undefined,
  language: AvailableLanguage
): string {
  if (!value || value.length === 0) return '';
  for (const lang of [language, ...DATA_LANGUAGE_FALLBACK_ORDER]) {
    const v = value.find(l => l.language === lang)?.value;
    if (v && v.trim() !== '') return v;
  }
  return '';
}
