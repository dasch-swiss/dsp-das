import { Constants, ListNodeV2 } from '@dasch-swiss/dsp-js';
import { v4 as uuidv4 } from 'uuid';
import { getOperatorsForObjectType, Operator } from './operators.config';

export enum PropertyObjectType {
  None = 'NONE',
  ValueObject = 'VALUE_OBJECT',
  ListValueObject = 'LIST_VALUE',
  LinkValueObject = 'LINK_VALUE',
  ResourceObject = 'RESOURCE_OBJECT',
}

export interface IriLabelPair {
  iri: string;
  label: string;
}

abstract class StatementValue {
  constructor(public statementId: string) {}
  abstract get writeValue(): string | undefined; // always a string
}

export class NodeValue extends StatementValue {
  constructor(
    statementId: string,
    private _value?: IriLabelPair
  ) {
    super(statementId);
  }

  get value(): IriLabelPair | undefined {
    return this._value;
  }

  get label(): string | undefined {
    return this._value?.label;
  }

  set value(val: IriLabelPair) {
    this._value = val;
  }

  get writeValue(): string | undefined {
    return this._value?.iri;
  }
}

export class StringValue extends StatementValue {
  constructor(
    statementId: string,
    private _value?: string
  ) {
    super(statementId);
  }

  get value(): string | undefined {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
  }

  get writeValue(): string | undefined {
    return this._value;
  }
}

export class ListNodeValue extends StatementValue {
  constructor(
    statementId: string,
    private _value?: ListNodeV2
  ) {
    super(statementId);
  }

  get value(): ListNodeV2 | undefined {
    return this._value;
  }

  set value(val: ListNodeV2) {
    this._value = val;
  }

  get writeValue(): string | undefined {
    return this._value?.id;
  }
}

export interface Predicate extends IriLabelPair {
  objectValueType: string;
  isLinkProperty: boolean;
  listObjectIri?: string; // only for list values
}

export interface GravsearchStatement {
  constructString: string;
  whereString: string;
}

export class StatementElement {
  readonly id = uuidv4();
  private _selectedSubjectNode?: NodeValue;
  private _selectedPredicate?: Predicate;
  private _selectedOperator?: Operator;
  private _selectedObjectNode?: NodeValue | StringValue;
  statementLevel = 0;

  constructor(subjectNode?: NodeValue, statementLevel = 0) {
    this._selectedSubjectNode = subjectNode;
    this.statementLevel = statementLevel;
  }

  get selectedSubjectNode(): NodeValue | undefined {
    return this._selectedSubjectNode;
  }

  get selectedPredicate(): Predicate | undefined {
    return this._selectedPredicate;
  }

  set selectedPredicate(prop: Predicate) {
    this._selectedPredicate = prop;
    this.selectedOperator = Operator.Equals; // default operator when property changes
  }

  get selectedObjectNode(): NodeValue | StringValue | undefined {
    return this._selectedObjectNode;
  }

  set selectedObjectNode(value: StringValue | NodeValue | undefined) {
    this._selectedObjectNode = value;
  }

  set selectedObjectValue(value: string | IriLabelPair) {
    if (typeof value === 'string') {
      this._selectedObjectNode = new StringValue(this.id, value);
    } else {
      this._selectedObjectNode = new NodeValue('', value);
    }
  }

  get selectedObjectWriteValue(): string | undefined {
    return this._selectedObjectNode?.writeValue;
  }

  get operators(): Operator[] {
    return this._selectedPredicate ? getOperatorsForObjectType(this._selectedPredicate) : [];
  }

  get selectedOperator(): Operator | undefined {
    return this._selectedOperator;
  }

  set selectedOperator(operator: Operator) {
    this._selectedOperator = operator;
    this.selectedObjectNode = undefined;
  }

  get isPristine(): boolean {
    return !this.selectedPredicate && !this.selectedOperator && !this.selectedObjectNode;
  }

  get isValidAndComplete(): boolean {
    return (
      this.selectedOperator === Operator.Exists ||
      this.selectedOperator === Operator.NotExists ||
      !!this.selectedObjectNode?.writeValue
    );
  }

  get objectType(): PropertyObjectType {
    if (
      !this.selectedOperator ||
      this.selectedOperator === Operator.Exists ||
      this.selectedOperator === Operator.NotExists
    ) {
      return PropertyObjectType.None;
    }
    if (
      !this.selectedPredicate?.objectValueType?.includes(Constants.KnoraApiV2) &&
      this.selectedOperator === Operator.Matches
    ) {
      return PropertyObjectType.ResourceObject;
    }

    if (this.selectedPredicate?.isLinkProperty && this.selectedOperator !== Operator.Matches) {
      return PropertyObjectType.LinkValueObject;
    }

    if (this.selectedPredicate?.objectValueType === Constants.ListValue) {
      return PropertyObjectType.ListValueObject;
    }
    return PropertyObjectType.ValueObject;
  }

  get isChildProperty(): boolean {
    return this.statementLevel > 0;
  }

  clearSelections() {
    this._selectedPredicate = undefined;
    this._selectedOperator = undefined;
    this._selectedObjectNode = undefined;
  }
}

export class OrderByItem {
  orderBy = false;
  constructor(
    public id: string,
    public label?: string,
    public disabled?: boolean
  ) {}
}

export interface QueryObject {
  query: string;
  properties: StatementElement[];
}

export interface SearchFormsState {
  selectedResourceClass: IriLabelPair | undefined;
  statementElements: StatementElement[];
  orderBy: OrderByItem[];
}

export type AdvancedSearchStateSnapshot = SearchFormsState & {
  selectedOntology: IriLabelPair | undefined;
};
