import { Cardinality, Constants, ReadResource } from '@dasch-swiss/dsp-js';
import { getResourceType } from './get-resource-type';
import { ResourceType } from './resource-type';

const KNORA_API_V2 = 'http://api.knora.org/ontology/knora-api/v2#';

const DEFAULT_CLASS = 'http://example.org/ontology#Representation';

/**
 * Builds the `entityInfo` a real `ReadResource` always carries.
 *
 * `ResourcesConversionUtil.createReadResource()` assigns `resource.entityInfo` unconditionally
 * from the ontology cache for every resource it deserializes, so a resource that holds a file
 * value in `properties` always also declares that property's cardinality on its class. The two
 * are not independent: `properties` can only be populated for a property the class declares.
 *
 * Fixtures that set `properties` without `entityInfo` describe a resource the API cannot return.
 */
const makeEntityInfo = (resourceType: string, propertyIris: string[]) =>
  ({
    classes: {
      [resourceType]: {
        propertiesList: propertyIris.map(propertyIndex => ({
          propertyIndex,
          cardinality: Cardinality._0_1,
          isInherited: false,
        })),
      },
    },
    properties: {},
  }) as unknown as ReadResource['entityInfo'];

// Minimal ReadResource factory: sets properties and type, plus the class definition
// declaring the file property's cardinality — as dsp-api always does.
const makeResource = (propertyKey: string, filename = 'file.jpg', type = DEFAULT_CLASS, valueType = ''): ReadResource =>
  ({
    type,
    properties: {
      [propertyKey]: [{ filename, type: valueType }],
    },
    entityInfo: makeEntityInfo(type, [propertyKey]),
  }) as unknown as ReadResource;

// A resource with no file value: its class declares no file-value cardinality either.
const makeResourceNoFile = (type = DEFAULT_CLASS): ReadResource =>
  ({
    type,
    properties: {},
    entityInfo: makeEntityInfo(type, []),
  }) as unknown as ReadResource;

describe('getResourceType', () => {
  describe('when the resource has a still image file value', () => {
    it('returns Image', () => {
      const resource = makeResource(
        Constants.HasStillImageFileValue,
        'image.jp2',
        DEFAULT_CLASS,
        Constants.StillImageFileValue
      );
      expect(getResourceType(resource)).toBe(ResourceType.Image);
    });
  });

  describe('when the resource has a moving image file value', () => {
    it('returns Video', () => {
      const resource = makeResource(Constants.HasMovingImageFileValue);
      expect(getResourceType(resource)).toBe(ResourceType.Video);
    });
  });

  describe('when the resource has an audio file value', () => {
    it('returns Audio', () => {
      const resource = makeResource(Constants.HasAudioFileValue);
      expect(getResourceType(resource)).toBe(ResourceType.Audio);
    });
  });

  describe('when the resource has a document file value', () => {
    it('returns Pdf for .pdf files', () => {
      const resource = makeResource(Constants.HasDocumentFileValue, 'report.pdf');
      expect(getResourceType(resource)).toBe(ResourceType.Pdf);
    });

    it('returns Document for non-pdf files', () => {
      const resource = makeResource(Constants.HasDocumentFileValue, 'report.docx');
      expect(getResourceType(resource)).toBe(ResourceType.Document);
    });
  });

  describe('when the resource has an archive file value', () => {
    it('returns Archive', () => {
      const resource = makeResource(Constants.HasArchiveFileValue, 'data.zip');
      expect(getResourceType(resource)).toBe(ResourceType.Archive);
    });
  });

  describe('when the resource has a text file value', () => {
    it('returns Text', () => {
      const resource = makeResource(Constants.HasTextFileValue, 'note.txt');
      expect(getResourceType(resource)).toBe(ResourceType.Text);
    });
  });

  describe('when the resource has no file value', () => {
    it('returns Annotation for knora-api:Region resources', () => {
      const resource = makeResourceNoFile(Constants.Region);
      expect(getResourceType(resource)).toBe(ResourceType.Annotation);
    });

    it('returns VideoSegment for knora-api:VideoSegment resources', () => {
      const resource = makeResourceNoFile(`${KNORA_API_V2}VideoSegment`);
      expect(getResourceType(resource)).toBe(ResourceType.VideoSegment);
    });

    it('returns AudioSegment for knora-api:AudioSegment resources', () => {
      const resource = makeResourceNoFile(`${KNORA_API_V2}AudioSegment`);
      expect(getResourceType(resource)).toBe(ResourceType.AudioSegment);
    });

    it('returns null for plain objects (compound check needed)', () => {
      const resource = makeResourceNoFile('http://example.org/ontology#SomeClass');
      expect(getResourceType(resource)).toBeNull();
    });
  });
});
