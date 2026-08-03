const HLIST_PREFIX = 'hlist=<';

/**
 * Derives a list's root node IRI from a list-value property's `guiAttributes`.
 *
 * A list-value property carries its list root in `guiAttributes[0]`, shaped
 * `hlist=<iri>` (produced by the ontology). Deriving the root from the
 * definition already in memory avoids a `/v2/node` round trip to discover it.
 *
 * @param guiAttributes the property definition's `guiAttributes`.
 * @returns the root node IRI, or `undefined` if no list is configured.
 */
export function listRootIriFromGuiAttributes(guiAttributes: string[] | undefined): string | undefined {
  const raw = guiAttributes?.[0];
  if (!raw?.startsWith(HLIST_PREFIX) || !raw.endsWith('>')) return undefined;
  return raw.substring(HLIST_PREFIX.length, raw.length - 1);
}
