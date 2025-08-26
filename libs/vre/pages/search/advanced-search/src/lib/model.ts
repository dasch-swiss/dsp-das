import { Constants, ListNodeV2 } from '@dasch-swiss/dsp-js';
import { v4 as uuidv4 } from 'uuid';

// Core data interfaces
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

// Form-related interfaces
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

// State interfaces
export interface SearchFormsState {
  ontologies: ApiData[];
  ontologiesLoading: boolean;
  resourceClasses: ApiData[];
  resourceClassesLoading: boolean;
  selectedProject: string | undefined;
  selectedOntology: ApiData | undefined;
  selectedResourceClass: ApiData | undefined;
  propertyFormList: PropertyFormItem[];
  properties: PropertyData[];
  propertiesLoading: boolean;
  propertiesOrderByList: OrderByItem[];
  filteredProperties: PropertyData[];
  matchResourceClassesLoading: boolean;
  resourcesSearchResultsLoading: boolean;
  resourcesSearchResultsCount: number;
  resourcesSearchNoResults: boolean;
  resourcesSearchResultsPageNumber: number;
  resourcesSearchResults: ApiData[];
  error?: any;
}

export interface AdvancedSearchStateSnapshot {
  ontologies: ApiData[];
  resourceClasses: ApiData[];
  selectedProject: string | undefined;
  selectedOntology: ApiData | undefined;
  selectedResourceClass: ApiData | undefined;
  propertyFormList: PropertyFormItem[];
  properties: PropertyData[];
  propertiesOrderByList: OrderByItem[];
  filteredProperties: PropertyData[];
}

// Constants
export const ResourceLabel = `${Constants.KnoraApiV2 + Constants.HashDelimiter}ResourceLabel`;

// objectType is manually set so that it uses the KnoraApiV2 string for boolean checks later
export const ResourceLabelObject = {
  iri: 'resourceLabel',
  label: 'Resource Label',
  objectType: ResourceLabel,
};
