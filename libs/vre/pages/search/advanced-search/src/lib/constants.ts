import { Constants } from '@dasch-swiss/dsp-js';
import { PropertyData } from './model';

export const ResourceLabel = `${Constants.KnoraApiV2 + Constants.HashDelimiter}ResourceLabel`;

export const ResourceLabelPropertyData: PropertyData = {
  iri: ResourceLabel,
  label: 'Resource Label',
  objectType: ResourceLabel,
  isLinkProperty: false,
} as const;
