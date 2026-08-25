import { Constants, ReadResource } from '@dasch-swiss/dsp-js';

/**
 * Whether a resource's class can carry a still image, and is therefore worth showing as a thumbnail.
 *
 * The check is the class's cardinality on `hasStillImageFileValue` rather than its `subClassOf`:
 * cardinalities arrive with `isInherited` set for anything picked up from a super class, so a class
 * that reaches `StillImageRepresentation` indirectly is recognised too, which a direct `subClassOf`
 * comparison would miss. `subClassOf` is kept as a fallback for definitions that carry no
 * cardinality list.
 *
 * All three still image file values — plain, external and vector — hang off this one property, so
 * this covers them together.
 */
export const isImageRepresentation = (resource: ReadResource): boolean => {
  const classDefinition = resource.entityInfo?.classes[resource.type];
  if (!classDefinition) {
    return false;
  }

  return (
    classDefinition.propertiesList.some(property => property.propertyIndex === Constants.HasStillImageFileValue) ||
    classDefinition.subClassOf.includes(Constants.StillImageRepresentation)
  );
};
