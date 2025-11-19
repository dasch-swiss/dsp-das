import { StringLiteralV2 } from '../generated';

/**
 * StringLiteral with a required language property.
 * Since the API spec has StringLiteralV2 with optional language,
 * we define this type for cases where language is required.
 */
export interface StringLiteralWithLanguage {
  value: string;
  language: string;
}

/**
 * Type guard to check if a StringLiteralV2 has a language property
 * @param literal - The string literal to check
 * @returns true if the literal has a non-empty language property
 */
export function hasLanguage(literal: StringLiteralV2): literal is StringLiteralWithLanguage {
  return typeof literal.language === 'string' && literal.language.length > 0;
}

/**
 * Filters an array of StringLiteralV2 to only include items with language tags
 * @param literals - Array of string literals that may or may not have language tags
 * @returns Array of only language-tagged string literals
 */
export function filterWithLanguage(literals: StringLiteralV2[]): StringLiteralWithLanguage[] {
  return literals.filter(hasLanguage);
}

/**
 * Type guard to check if an unknown object is a valid string literal with language
 * Used for filtering DSP-JS StringLiteral types and other unknown data
 * @param obj - The object to check
 * @returns true if the object has both value and language properties
 */
export function isStringLiteralWithLanguage(obj: unknown): obj is StringLiteralWithLanguage {
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
 * Filters an array of unknown items to only include valid string literals with language tags
 * Works with both StringLiteralV2 and DSP-JS StringLiteral types
 * @param items - Array of items that may or may not have language tags
 * @returns Array of only language-tagged items
 */
export function ensureLanguageTaggedLiterals(items: unknown[]): StringLiteralWithLanguage[] {
  return items.filter(isStringLiteralWithLanguage);
}
