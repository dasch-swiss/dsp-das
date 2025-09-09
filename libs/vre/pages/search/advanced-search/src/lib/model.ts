import { Constants, ListNodeV2 } from '@dasch-swiss/dsp-js';

export interface ApiData {
  iri: string;
  label: string;
}

export interface PropertyData {
  iri: string;
  label: string;
  objectType: string;
  isLinkedResourceProperty: boolean;
  listIri?: string; // only for list values
}

export interface GravsearchPropertyString {
  constructString: string;
  whereString: string;
}

export interface PropertyFormItem {
  id: string;
  selectedProperty: PropertyData | undefined;
  selectedOperator: string | undefined;
  searchValue: string | PropertyFormItem[] | undefined;
  operators: string[] | undefined;
  list: ListNodeV2 | undefined;
  matchPropertyResourceClasses?: any[] | undefined;
  selectedMatchPropertyResourceClass?: any | undefined;
  isChildProperty?: boolean;
  childPropertiesList?: PropertyData[];
  searchValueLabel?: string;
}

export interface OrderByItem {
  id: string;
  label: string;
  orderBy: boolean;
  disabled?: boolean;
}

export interface ParentChildPropertyPair {
  parentProperty: PropertyFormItem;
  childProperty: PropertyFormItem;
}

export interface SearchItem {
  value: string;
  objectType: string;
}

export interface QueryObject {
  query: string;
  properties: PropertyFormItem[];
}

export interface SearchFormsState {
  ontologies: ApiData[];
  ontologiesLoading: boolean;
  resourceClasses: ApiData[];
  resourceClassesLoading: boolean;
  selectedProject: string;
  selectedOntology: ApiData | undefined;
  selectedResourceClass: ApiData | undefined;
  propertyFormList: PropertyFormItem[];
  properties: PropertyData[];
  propertiesLoading: boolean;
  propertiesOrderBy: OrderByItem[];
  filteredProperties: PropertyData[];
  matchResourceClassesLoading: boolean;
  resourcesSearchResultsLoading: boolean;
  resourcesSearchResultsCount: number;
  resourcesSearchNoResults: boolean;
  resourcesSearchResultsPageNumber: number;
  resourcesSearchResults: ApiData[];
  error?: any;
}

export type AdvancedSearchStateSnapshot = Pick<
  SearchFormsState,
  | 'ontologies'
  | 'resourceClasses'
  | 'selectedProject'
  | 'selectedOntology'
  | 'selectedResourceClass'
  | 'propertyFormList'
  | 'properties'
  | 'propertiesOrderBy'
  | 'filteredProperties'
>;

export const ResourceLabel = `${Constants.KnoraApiV2 + Constants.HashDelimiter}ResourceLabel`;

export const ResourceLabelPropertyData: PropertyData = {
  iri: ResourceLabel,
  label: 'Resource Label',
  objectType: ResourceLabel,
  isLinkedResourceProperty: false,
} as const;
