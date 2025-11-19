import { StringLiteralV2 } from '../generated';

/**
 * StringLiteral with required language property.
 * Defined separately since API spec has optional language.
 */
export interface StringLiteralWithLanguage {
  value: string;
  language: string;
}

/**
 * Type guard checking if an object has both value and language properties.
 */
function hasLanguageTag(obj: unknown): obj is StringLiteralWithLanguage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'value' in obj &&
    'language' in obj &&
    typeof (obj as { language: unknown }).language === 'string' &&
    (obj as { language: string }).language.length > 0 &&
    typeof (obj as { value: unknown }).value === 'string'
  );
}

/**
 * Filters StringLiteralV2[] to include only items with language tags.
 */
export function filterWithLanguage(literals: StringLiteralV2[]): StringLiteralWithLanguage[] {
  return literals.filter(hasLanguageTag);
}

/**
 * Filters unknown[] to include only valid string literals with language tags.
 * Useful for DSP-JS StringLiteral types and other external data.
 * @deprecated Use ensureWithDefaultLanguage() to prevent data loss
 */
export function ensureLanguageTaggedLiterals(items: unknown[]): StringLiteralWithLanguage[] {
  return items.filter(hasLanguageTag);
}

/**
 * Converts StringLiteralV2[] to StringLiteralWithLanguage[] without data loss.
 * Items without language tags are assigned the default language.
 * This prevents silent data loss when API returns PlainStringLiteralV2.
 *
 * @param literals - Array of StringLiteralV2 (union of tagged and plain)
 * @param defaultLanguage - Language to assign to items without language tag (default: 'en')
 * @returns Array with all items having language tags
 */
export function ensureWithDefaultLanguage(
  literals: StringLiteralV2[],
  defaultLanguage?: string
): StringLiteralWithLanguage[];
/**
 * Converts unknown[] to StringLiteralWithLanguage[] without data loss.
 * Items without language tags are assigned the default language.
 * Useful for DSP-JS StringLiteral types and other external data.
 *
 * @param literals - Array of unknown items (e.g., DSP-JS StringLiteral[])
 * @param defaultLanguage - Language to assign to items without language tag (default: 'en')
 * @returns Array with all items having language tags
 */
export function ensureWithDefaultLanguage(literals: unknown[], defaultLanguage?: string): StringLiteralWithLanguage[];
export function ensureWithDefaultLanguage(
  literals: StringLiteralV2[] | unknown[],
  defaultLanguage = 'en'
): StringLiteralWithLanguage[] {
  return (literals as Array<{ value?: unknown; language?: unknown }>)
    .filter((item): item is { value: string; language?: unknown } => typeof item?.value === 'string')
    .map(item => ({
      value: item.value,
      language: typeof item.language === 'string' && item.language.length > 0 ? item.language : defaultLanguage,
    }));
}
