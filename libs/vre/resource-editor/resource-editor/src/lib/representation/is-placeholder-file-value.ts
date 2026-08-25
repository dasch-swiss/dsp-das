import { ReadFileValue } from '@dasch-swiss/dsp-js';
import { PLACEHOLDER_SENTINEL } from '@dasch-swiss/vre/shared/app-common';

/**
 * Sentinel asset reference used by dsp-api / dsp-tools to mark a `FileValue`
 * as a placeholder, i.e. no real asset has been delivered to Sipi yet.
 * See the "Placeholder Values" project (DEV-6568).
 *
 * Kept as an alias so the existing call sites in this lib keep their local name; the canonical
 * definition now lives in `app-common` because `ui/ui` and `app-helper-services` need it too and
 * cannot import from this lib (it would cycle). See DEV-6994.
 */
export const PLACEHOLDER_FILE_SENTINEL = PLACEHOLDER_SENTINEL;

/**
 * Returns `true` when the given file value is a placeholder (its `filename` is
 * the placeholder sentinel), meaning there is no real asset to load from Sipi.
 */
export function isPlaceholderFileValue(fileValue: ReadFileValue | null | undefined): boolean {
  return fileValue?.filename === PLACEHOLDER_FILE_SENTINEL;
}

// The legal-value helpers are shared across libs; re-exported here so this lib's existing relative
// imports keep working.
export { isPlaceholderLegalValue, joinPlaceholderLegalValues } from '@dasch-swiss/vre/shared/app-common';
