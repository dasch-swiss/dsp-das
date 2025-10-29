import { Constants } from '@dasch-swiss/dsp-js';
import { IriLabelPair, Predicate, SearchFormsState, StatementElement } from './model';

export const ResourceLabel = `${Constants.KnoraApiV2 + Constants.HashDelimiter}ResourceLabel`;

export const ResourceLabelPropertyData: Predicate = {
  iri: ResourceLabel,
  label: 'Resource Label',
  objectRange: ResourceLabel,
  isLinkProperty: false,
} as const;

export const SEARCH_ALL_RESOURCE_CLASSES_OPTION: IriLabelPair = {
  iri: 'all-resource-classes',
  label: 'All resource classes',
};

export const INITIAL_FORMS_STATE: SearchFormsState = {
  selectedResourceClass: undefined,
  statementElements: [new StatementElement()],
  propertiesOrderBy: [],
};
