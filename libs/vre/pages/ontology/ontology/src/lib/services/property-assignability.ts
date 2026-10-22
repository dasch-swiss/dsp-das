/**
 * Mirrors dsp-api's subject-class check on adding a cardinality: a property
 * whose `subjectType` names a class can only be added to that class or one of
 * its subclasses. Such restrictions can only come from a data-model import —
 * the API offers no way to set or change them — so the editor must not offer a
 * drop or menu entry the server will reject.
 *
 * `superClassesOf` maps a class IRI to its direct superclasses and returns
 * `undefined` for classes outside the project's ontologies (knora-api base
 * classes, shared external ontologies). An unknown `subjectType` is not
 * blocked: it cannot be resolved here, so the server stays the judge.
 */
export function violatesSubjectTypeConstraint(
  subjectType: string | undefined,
  classIri: string,
  superClassesOf: (classIri: string) => string[] | undefined
): boolean {
  if (!subjectType || superClassesOf(subjectType) === undefined) {
    return false;
  }

  const visited = new Set<string>();
  const queue = [classIri];
  while (queue.length > 0) {
    const iri = queue.shift()!;
    if (iri === subjectType) {
      return false;
    }
    if (visited.has(iri)) {
      continue;
    }
    visited.add(iri);
    queue.push(...(superClassesOf(iri) ?? []));
  }
  return true;
}
