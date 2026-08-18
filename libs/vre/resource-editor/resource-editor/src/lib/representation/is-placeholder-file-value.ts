import { ReadFileValue } from '@dasch-swiss/dsp-js';

/**
 * Sentinel asset reference used by dsp-api / dsp-tools to mark a `FileValue`
 * as a placeholder, i.e. no real asset has been delivered to Sipi yet.
 * See the "Placeholder Values" project (DEV-6568).
 */
export const PLACEHOLDER_FILE_SENTINEL = 'urn:dasch:placeholder';

/**
 * Returns `true` when the given file value is a placeholder (its `filename` is
 * the placeholder sentinel), meaning there is no real asset to load from Sipi.
 */
export function isPlaceholderFileValue(fileValue: ReadFileValue | null | undefined): boolean {
  return fileValue?.filename === PLACEHOLDER_FILE_SENTINEL;
}

/**
 * Returns `true` when a legal value (copyright holder, a single authorship entry, or a license IRI)
 * is the placeholder sentinel.
 *
 * Separate from `isPlaceholderFileValue`, which inspects only `filename`: dsp-api writes the same
 * literal into `internalFilename`, `copyrightHolder`, `authorship` and `licenseIri` independently, so
 * a real asset can still carry placeholder legal info (and vice versa). See DEV-6982.
 */
export function isPlaceholderLegalValue(value: string | null | undefined): boolean {
  return value === PLACEHOLDER_FILE_SENTINEL;
}
