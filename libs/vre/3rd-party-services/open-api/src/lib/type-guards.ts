import { LanguageTaggedStringLiteralV2, StringLiteralV2 } from '../generated';

/**
 * Type guard to check if a StringLiteralV2 is a LanguageTaggedStringLiteralV2
 * @param literal - The string literal to check
 * @returns true if the literal has a language property
 */
export function isLanguageTaggedStringLiteral(
  literal: StringLiteralV2
): literal is LanguageTaggedStringLiteralV2 {
  return 'language' in literal && typeof literal.language === 'string';
}

/**
 * Filters an array of StringLiteralV2 to only include items with language tags
 * @param literals - Array of string literals that may or may not have language tags
 * @returns Array of only language-tagged string literals
 */
export function filterLanguageTaggedLiterals(
  literals: StringLiteralV2[]
): LanguageTaggedStringLiteralV2[] {
  return literals.filter(isLanguageTaggedStringLiteral);
}

/**
 * Type guard to check if an object has both value and language properties
 * Used for converting DSP-JS StringLiteral to LanguageTaggedStringLiteralV2
 * @param obj - The object to check
 * @returns true if the object has both value and language properties
 */
export function hasLanguageTag(obj: unknown): obj is LanguageTaggedStringLiteralV2 {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'value' in obj &&
    'language' in obj &&
    typeof (obj as { language: unknown }).language === 'string' &&
    typeof (obj as { value: unknown }).value === 'string'
  );
}

/**
 * Filters an array to only include items with language tags
 * Works with both StringLiteralV2 and DSP-JS StringLiteral types
 * @param items - Array of items that may or may not have language tags
 * @returns Array of only language-tagged items
 */
export function ensureLanguageTaggedLiterals(items: unknown[]): LanguageTaggedStringLiteralV2[] {
  return items.filter(hasLanguageTag);
}
