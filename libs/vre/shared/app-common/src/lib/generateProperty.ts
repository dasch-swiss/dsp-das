import {
  Constants,
  IHasPropertyWithPropertyDefinition,
  ReadLinkValue,
  ReadResource,
  ReadStillImageFileValue,
} from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from './property-info-values.interface';

/**
 * Contains every changes needed for displaying properties without bug.
 * It mainly removes unwanted property
 */
export class GenerateProperty {
  public static commonProperty(resource: ReadResource) {
    return this._initProps(resource)
      .filter(prop => !prop.propDef['isLinkProperty'])
      .filter(prop => !prop.propDef.subPropertyOf.includes('http://api.knora.org/ontology/knora-api/v2#hasFileValue'))
      .map(this._displayExistingLinkedValues);
  }

  public static incomingRessourceProperty(resource: ReadResource) {
    return this.commonProperty(resource).filter(
      v => v.propDef.id !== 'http://api.knora.org/ontology/knora-api/v2#hasStillImageFileValue'
    );
  }

  public static regionProperty(resource: ReadResource) {
    return this.commonProperty(resource)
      .filter(v => v.propDef.objectType !== 'http://api.knora.org/ontology/knora-api/v2#Representation')
      .filter(v => v.propDef.id !== 'http://api.knora.org/ontology/knora-api/v2#isRegionOfValue');
  }

  public static segmentProperty(resource: ReadResource, type: 'VideoSegment' | 'AudioSegment') {
    return this.commonProperty(resource).filter(
      prop => prop.propDef.id !== `http://api.knora.org/ontology/knora-api/v2#is${type}OfValue`
    );
  }

  private static _initProps(resource: ReadResource): PropertyInfoValues[] {
    let props = resource.entityInfo.classes[resource.type]
      .getResourcePropertiesList()
      .map((prop: IHasPropertyWithPropertyDefinition) => {
        let propInfoAndValues: PropertyInfoValues;

        switch (prop.propertyDefinition.objectType) {
          case Constants.StillImageFileValue:
            propInfoAndValues = {
              propDef: prop.propertyDefinition,
              guiDef: prop,
              values: resource.getValuesAs(prop.propertyIndex, ReadStillImageFileValue),
            };
            break;

          default:
            // the object type is none from above
            propInfoAndValues = {
              propDef: prop.propertyDefinition,
              guiDef: prop,
              values: resource.getValues(prop.propertyIndex),
            };
        }
        return propInfoAndValues;
      });

    // sort properties by guiOrder
    props = props
      .filter(prop => prop.propDef.objectType !== Constants.GeomValue)
      .sort((a, b) => (a.guiDef.guiOrder > b.guiDef.guiOrder ? 1 : -1))
      // to get equal results on all browser engines which implements sorting in different way
      // properties list has to be sorted again, pushing all "has..." properties to the bottom
      // TODO FOLLOWING LINE IS A BUG ARRAY-CALLBACK-RETURN SHOULDNT BE DISABLED
      // eslint-disable-next-line array-callback-return
      .sort(a => {
        if (a.guiDef.guiOrder === undefined) {
          return 1;
        }
      });

    return props;
  }

  private static _displayExistingLinkedValues = (prop: PropertyInfoValues) => {
    if (prop.propDef.objectType === Constants.LinkValue) {
      prop.values = prop.values.filter(value => {
        return (value as ReadLinkValue).linkedResource !== undefined;
      });
    }
    return prop;
  };
}
