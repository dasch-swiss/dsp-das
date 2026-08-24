/**
 * Sentinel used by dsp-api / dsp-tools to mark legal metadata (and a `FileValue`'s asset reference)
 * as a placeholder, i.e. the real value is not known yet.
 *
 * dsp-api defines it once (`PlaceholderIri`) and reuses the same literal for four fields:
 * `internalFilename`, `copyrightHolder`, `authorship` and `licenseIri`. See the "Placeholder Values"
 * project (DEV-6567 / DEV-6982).
 *
 * Lives in `app-common` rather than beside the resource viewer because three separate layers need it:
 * the file-value renderers (`resource-editor`), the data-side rights statement (`ui/ui`), and the
 * project rights resolver (`app-helper-services`). `ui/ui` cannot import from `resource-editor` —
 * `resource-editor` already imports `ui/ui`, so the reverse direction would be a cycle. Keep this file
 * dependency-free (pure functions over `string`/`string[]`) so `app-common`'s dependency set does not
 * grow; in particular the translated label is passed *in* rather than resolved here, so no
 * `@ngx-translate` dependency is needed. See DEV-6994.
 */
export const PLACEHOLDER_SENTINEL = 'urn:dasch:placeholder';

/**
 * Returns `true` when a legal value (copyright holder, a single authorship entry, or a license IRI)
 * is the placeholder sentinel.
 */
export function isPlaceholderLegalValue(value: string | null | undefined): boolean {
  return value === PLACEHOLDER_SENTINEL;
}

/**
 * Joins a legal value list (e.g. authorship) into a display string, replacing any placeholder
 * sentinel with `placeholderLabel`.
 *
 * `placeholderLabel` is passed in already translated so callers resolve it with the `| translate`
 * pipe in their template — the repo's convention for rendered text — instead of injecting
 * `TranslateService` just to call `.instant()` during change detection.
 */
export function joinPlaceholderLegalValues(values: string[] | null | undefined, placeholderLabel: string): string {
  return (values ?? []).map(value => (isPlaceholderLegalValue(value) ? placeholderLabel : value)).join(', ');
}
