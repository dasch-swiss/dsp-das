import { Constants, ListNodeV2 } from '@dasch-swiss/dsp-js';
import { v4 as uuidv4 } from 'uuid';
import { ResourceLabel } from './constants';
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
  abstract get writeValue(): string | undefined;
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

export class Predicate implements IriLabelPair {
  constructor(
    public iri: string,
    public label: string,
    public objectValueType: string,
    public isLinkProperty: boolean,
    public listObjectIri?: string
  ) {}

  get isKnoraValueType(): boolean {
    return this.objectValueType.includes(Constants.KnoraApiV2);
  }
}

export interface GravsearchStatement {
  constructString: string;
  whereString: string;
}

export class StatementElement {
  readonly id = uuidv4();
  private _subjectNode?: NodeValue;
  private _selectedPredicate?: Predicate;
  private _selectedOperator?: Operator;
  private _selectedObjectNode?: NodeValue | StringValue;
  private _parentStatement?: StatementElement;
  statementLevel = 0;

  constructor(subjectNode?: NodeValue, statementLevel = 0, parentStatement?: StatementElement) {
    this._subjectNode = subjectNode;
    this.statementLevel = statementLevel;
    this._parentStatement = parentStatement;
  }

  get subjectNode(): NodeValue | undefined {
    return this._subjectNode;
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

  get parentId(): string | undefined {
    return this._parentStatement?.id;
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
  selectedResourceClass: IriLabelPair;
  statementElements: StatementElement[];
  orderBy: OrderByItem[];
}

export type AdvancedSearchStateSnapshot = SearchFormsState & {
  selectedOntology: IriLabelPair | undefined;
};

class GravsearchWriterScoped {
  private readonly RDF_TYPE = 'a';
  private readonly RDFS_LABEL = 'rdfs:label';
  private readonly MAIN_RESOURCE_PLACEHOLDER = '?mainRes';
  private readonly RESOURCE_PLACEHOLDER = '?res';
  private readonly LABEL_PLACEHOLDER = '?label';
  private readonly LIST_VALUE_AS_LIST_NODE = Constants.ListValueAsListNode.split('#').pop();

  private _id: string;
  private _parentId: string | undefined;
  private _operator;
  private _objectType: string | undefined;
  private _selectedValue: string | undefined;
  private _selectedPredicate: string;

  constructor(
    private _statements: StatementElement[],
    private _index: number
  ) {
    const currentStatement = this._statements[this._index];
    this._id = currentStatement.id;
    this._parentId = currentStatement.parentId;
    this._operator = currentStatement.selectedOperator!;
    this._selectedPredicate = currentStatement.selectedPredicate!.iri;
    this._objectType = currentStatement.selectedPredicate?.objectValueType;
    this._selectedValue = currentStatement.selectedObjectWriteValue;
  }

  get isKnoraValueType(): boolean {
    return !!this._objectType && this._objectType.includes(Constants.KnoraApiV2);
  }

  get isLinkedResource(): boolean {
    return !this.isKnoraValueType && this._objectType !== ResourceLabel;
  }

  get subject(): string {
    if (!this._parentId) {
      return this.MAIN_RESOURCE_PLACEHOLDER;
    }
    if (this._objectType === ResourceLabel) {
      return this.LABEL_PLACEHOLDER;
    }
    const subjectId = this._parentId || this._id;
    const subjectIndex = this._statements.findIndex(stm => stm.id === subjectId);
    return `${this.RESOURCE_PLACEHOLDER}${subjectIndex}`;
  }

  get predicate() {
    if ((this._operator === Operator.Equals || this._operator === Operator.NotEquals) && !this.isKnoraValueType) {
      return this.RDF_TYPE;
    }
    return `<${this._selectedPredicate}>`;
  }

  get object(): string {
    if (!this._parentId) {
      return `${this.RESOURCE_PLACEHOLDER}${this._index}`;
    } else if (
      (this._operator === Operator.Equals || this._operator === Operator.NotEquals) &&
      !this.isKnoraValueType
    ) {
      return `<${this._selectedValue}>`;
    } else {
      return '';
    }
  }

  getToSPO(objectOrValue: string): string {
    return `${this.subject} ${this.predicate} ${objectOrValue} .`;
  }

  get constructStatement(): string {
    return this._objectType !== ResourceLabel && this._operator !== Operator.IsLike ? this.getToSPO(this.object) : '';
  }

  get whereStatement(): string {
    if (this._objectType === ResourceLabel) {
      return this._whereStatementForLabelComparison();
    } else if (this._objectType === Constants.ListValue) {
      return this._getWhereStatementForListObjectComparison();
    } else {
      return this._whereStatement();
    }
  }

  private _whereStatement(): string {
    let whereStm = '';
    if ((this._operator === Operator.Equals || this._operator === Operator.NotEquals) && !this.isKnoraValueType) {
      // add the statement for the resource class
      console.log('IIIII', this.predicate); // TODO: REMOVE?
      whereStm += `\n${this.subject} ${this.predicate} <${this._selectedValue}> .\n`;
    } else {
      whereStm = this.getToSPO(this.object); // node projection for accessing values
    }

    if (this._operator === Operator.NotExists || this._operator === Operator.NotEquals) {
      // simply wrap everything into FILTER NOT EXISTS
      whereStm = `FILTER NOT EXISTS { \n${whereStm}\n}\n`;
    }

    return whereStm;
  }

  private _whereStatementForLabelComparison(): string {
    let s = this.getToSPO(this.object);
    switch (this._operator) {
      case Operator.Equals:
        s += `\nFILTER (${this.object} = "${this._selectedValue}") .\n`;
        return s;
      case Operator.NotEquals:
        s += `\nFILTER (${this.object} != "${this._selectedValue}") .\n`;
        return s;
      case Operator.Matches:
        s += `\nFILTER knora-api:matchLabel(${this.object}, "${this._selectedValue}") .\n`;
        return s;
      case Operator.IsLike:
        s += `\nFILTER regex(${this.object}, "${this._selectedValue}", "i") .\n`;
        return s;
      default:
        return '';
    }
  }

  private _getWhereStatementForListObjectComparison(): string {
    let whereStm = this.getToSPO(this.object);

    if (this._operator === Operator.NotEquals) {
      whereStm += `\nFILTER NOT EXISTS { ${this.object} knora-api:${this.LIST_VALUE_AS_LIST_NODE} <${this._selectedValue}> . }`;
    }
    if (this._operator === Operator.Equals || this._operator === Operator.Matches) {
      whereStm += `\n${this.object} knora-api:${this.LIST_VALUE_AS_LIST_NODE} <${this._selectedValue}> .`;
    }

    if (this._operator === Operator.NotExists) {
      whereStm = `FILTER NOT EXISTS { \n${whereStm}\n}`;
    }
    return whereStm;
  }

  private _operatorToSymbol(operator: string | undefined): string {
    switch (operator) {
      case Operator.Equals:
        return '=';
      case Operator.NotEquals:
        return '!=';
      case Operator.GreaterThan:
        return '>';
      case Operator.GreaterThanEquals:
        return '>=';
      case Operator.LessThan:
        return '<';
      case Operator.LessThanEquals:
        return '<=';
      case Operator.Exists:
        return 'E';
      case Operator.NotExists:
        return '!E';
      case Operator.IsLike:
        return 'regex';
      case Operator.Matches:
        return Constants.MatchText;
      default:
        return '';
    }
  }
}

export class GravsearchWriter {
  constructor(private _statements: StatementElement[]) {}

  at(index: number): GravsearchWriterScoped {
    return new GravsearchWriterScoped(this._statements, index);
  }
}
