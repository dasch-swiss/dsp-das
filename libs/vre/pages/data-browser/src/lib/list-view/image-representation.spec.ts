import { Cardinality, Constants, ReadResource } from '@dasch-swiss/dsp-js';
import { isImageRepresentation } from './image-representation';

const resourceOfClass = (classDefinition: unknown): ReadResource =>
  ({
    type: 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing',
    entityInfo: classDefinition
      ? { classes: { 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing': classDefinition } }
      : undefined,
  }) as ReadResource;

describe('isImageRepresentation', () => {
  it('recognises a class with a cardinality on hasStillImageFileValue', () => {
    const resource = resourceOfClass({
      propertiesList: [{ propertyIndex: Constants.HasStillImageFileValue, cardinality: Cardinality._1 }],
      subClassOf: [],
    });

    expect(isImageRepresentation(resource)).toBe(true);
  });

  it('recognises a class that inherits the cardinality from a super class', () => {
    const resource = resourceOfClass({
      propertiesList: [
        { propertyIndex: Constants.HasStillImageFileValue, cardinality: Cardinality._1, isInherited: true },
      ],
      subClassOf: ['http://0.0.0.0:3333/ontology/0001/anything/v2#SomeIntermediateClass'],
    });

    expect(isImageRepresentation(resource)).toBe(true);
  });

  it('falls back to subClassOf when the definition carries no cardinality list', () => {
    const resource = resourceOfClass({ propertiesList: [], subClassOf: [Constants.StillImageRepresentation] });

    expect(isImageRepresentation(resource)).toBe(true);
  });

  it('rejects a class with no still image file value', () => {
    const resource = resourceOfClass({
      propertiesList: [{ propertyIndex: Constants.HasDocumentFileValue, cardinality: Cardinality._1 }],
      subClassOf: [Constants.DocumentRepresentation],
    });

    expect(isImageRepresentation(resource)).toBe(false);
  });

  it('rejects a resource whose class definition is missing', () => {
    expect(isImageRepresentation(resourceOfClass(null))).toBe(false);
  });
});
