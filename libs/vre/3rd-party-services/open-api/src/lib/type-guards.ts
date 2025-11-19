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
 */
export function ensureLanguageTaggedLiterals(items: unknown[]): StringLiteralWithLanguage[] {
  return items.filter(hasLanguageTag);
}
