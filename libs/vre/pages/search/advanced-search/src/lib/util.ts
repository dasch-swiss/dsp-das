import { Constants } from '@dasch-swiss/dsp-js';
import { v4 as uuidv4 } from 'uuid';
import { PropertyFormItem, OrderByItem, PropertyData, ResourceLabel, ApiData, SearchFormsState } from './model';
import { Operators } from './service/operators.config';

export function isPropertyFormItemInvalid(prop: PropertyFormItem): boolean {
  // No property selected
  if (!prop.selectedProperty) return true;

  // Selected operator is 'exists' or 'does not exist' - these are always valid
  if (prop.selectedOperator === Operators.Exists || prop.selectedOperator === Operators.NotExists) return false;

  // If searchValue is an array (child properties), validate each child
  if (Array.isArray(prop.searchValue)) {
    if (!prop.searchValue.length) return true;
    return prop.searchValue.some(childProp => isPropertyFormItemInvalid(childProp));
  }

  // Selected operator is NOT 'exists' or 'does not exist' AND search value is undefined or empty
  if (!prop.searchValue || prop.searchValue === '') return true;

  return false;
}

export function createOrderByItem(property: PropertyFormItem): OrderByItem {
  return {
    id: property.id,
    label: property.selectedProperty?.label || '',
    orderBy: false,
    disabled:
      property.selectedProperty?.objectType === ResourceLabel ||
      property.selectedProperty?.objectType?.includes(Constants.KnoraApiV2),
  };
}

export function updateOrderByList(currentList: OrderByItem[], property: PropertyFormItem): OrderByItem[] {
  const indexInCurrentOrderByList = currentList.findIndex(item => item.id === property.id);
  const newOrderByItem = createOrderByItem(property);
  const updatedOrderByList = [...currentList];

  if (property.selectedProperty?.objectType !== Constants.ListValue) {
    if (indexInCurrentOrderByList > -1) {
      updatedOrderByList[indexInCurrentOrderByList] = newOrderByItem;
    } else {
      updatedOrderByList.push(newOrderByItem);
    }
  } else if (indexInCurrentOrderByList > -1) {
    updatedOrderByList.splice(indexInCurrentOrderByList, 1);
  }

  return updatedOrderByList;
}

export const SEARCH_ALL_RESOURCE_CLASSES_OPTION: ApiData = {
  iri: 'all-resource-classes',
  label: 'All resource classes',
};

export const INITIAL_FORMS_STATE: SearchFormsState = {
  ontologies: [],
  ontologiesLoading: false,
  resourceClasses: [],
  resourceClassesLoading: false,
  selectedProject: '',
  selectedOntology: undefined,
  selectedResourceClass: undefined,
  propertyFormList: [new PropertyFormItem()],
  properties: [],
  propertiesLoading: false,
  propertiesOrderBy: [],
  filteredProperties: [],
  matchResourceClassesLoading: false,
  resourcesSearchResultsLoading: false,
  resourcesSearchResultsCount: 0,
  resourcesSearchNoResults: false,
  resourcesSearchResultsPageNumber: 0,
  resourcesSearchResults: [],
};
