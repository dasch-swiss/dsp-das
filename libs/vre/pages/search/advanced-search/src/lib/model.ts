import { ListNodeV2 } from '@dasch-swiss/dsp-js';
import { v4 as uuidv4 } from 'uuid';
import { getOperatorsForObjectType, Operator } from './service/operators.config';

export interface ApiData {
  iri: string;
  label: string;
}

export interface PropertyData {
  iri: string;
  label: string;
  objectType: string;
  isLinkProperty: boolean;
  listIri?: string; // only for list values
}

export interface GravsearchPropertyString {
  constructString: string;
  whereString: string;
}

export class PropertyFormItem {
  readonly id = uuidv4();
  private _selectedProperty: PropertyData | undefined;
  private _selectedOperator: Operator | undefined;
  private _searchValue: string | PropertyFormItem[] | undefined;
  private _searchValueLabel: string | undefined;
  list: ListNodeV2 | undefined;
  matchPropertyResourceClasses?: any[] | undefined; // Todo: Set those
  selectedMatchPropertyResourceClass?: any | undefined;
  isChildProperty?: boolean;
  childPropertiesList?: PropertyData[];

  get selectedProperty(): PropertyData | undefined {
    return this._selectedProperty;
  }

  set selectedProperty(prop: PropertyData | undefined) {
    this._selectedProperty = prop;
    this.selectedOperator = undefined;
  }

  get searchValueLabel(): string | undefined {
    return this._searchValueLabel;
  }

  get searchValue(): string | PropertyFormItem[] | undefined {
    return this._searchValue;
  }

  set searchValue(value: string | PropertyFormItem[] | ApiData | undefined) {
    if (this._isApiData(value)) {
      this._searchValue = value.iri;
      this._searchValueLabel = value.label;
    } else {
      this._searchValue = value;
      this._searchValueLabel = undefined;
    }
  }

  get operators(): Operator[] {
    return this._selectedProperty ? getOperatorsForObjectType(this._selectedProperty) : [];
  }

  get selectedOperator(): Operator | undefined {
    return this._selectedOperator;
  }

  set selectedOperator(operator: Operator | undefined) {
    this._selectedOperator = operator;
    this.searchValue = undefined;
    this._searchValueLabel = undefined; // Todo: not needed currently -> remove after proper refactor?
    this.matchPropertyResourceClasses = undefined;
    this.selectedMatchPropertyResourceClass = undefined;
    this.list = undefined;
  }

  addChildProperty(): void {
    if (!Array.isArray(this.searchValue)) {
      this.searchValue = [];
    }
    this.searchValue.push(new PropertyFormItem());
    if (!this.childPropertiesList) {
      this.childPropertiesList = [];
    }
  }

  updateChildProperty(childProperty: PropertyData): void {
    if (this.childPropertiesList) {
      this.childPropertiesList = this.childPropertiesList.map(c => (c.iri === childProperty.iri ? childProperty : c));
    }
  }

  private _isApiData(value: any): value is ApiData {
    return value && typeof value === 'object' && 'iri' in value && 'label' in value;
  }
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
  selectedResourceClass: ApiData | undefined;
  propertyFormList: PropertyFormItem[];
  propertiesOrderBy: OrderByItem[];
}

export type AdvancedSearchStateSnapshot = Pick<
  SearchFormsState,
  'selectedResourceClass' | 'propertyFormList' | 'propertiesOrderBy'
> & {
  selectedProject: string;
  selectedOntology: ApiData | undefined;
};
