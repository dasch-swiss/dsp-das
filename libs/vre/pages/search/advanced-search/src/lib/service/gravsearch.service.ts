import { inject, Injectable } from '@angular/core';
import { Constants } from '@dasch-swiss/dsp-js';
import { ResourceLabel } from '../constants';
import { GravsearchWriter, StatementElement } from '../model';
import { Operator } from '../operators.config';
import { OntologyDataService } from './ontology-data.service';
import { SearchStateService } from './search-state.service';

@Injectable()
export class GravsearchService {
  private dataService: OntologyDataService = inject(OntologyDataService);
  private _searchStateService = inject(SearchStateService);

  get ontoIri(): string {
    return this.dataService.selectedOntology.iri;
  }

  get ontoShortCode(): string {
    const ontoShortCodeMatch = this.ontoIri.match(/\/([^/]+)\/v2$/);
    if (!ontoShortCodeMatch) {
      throw new Error(`Invalid ontology IRI format: ${this.ontoIri}`);
    }
    return ontoShortCodeMatch[1];
  }

  generateGravSearchQuery(statements: StatementElement[]): string {
    const constructStatements = this._buildConstructStatements(statements);
    const whereClause = this._buildWhereClause(statements);

    const gravSearch =
      'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\n' +
      `PREFIX ${this.ontoShortCode}: <${this.ontoIri}#>\n` +
      'CONSTRUCT {\n' +
      '?mainRes knora-api:isMainResource true .\n' +
      `${constructStatements}\n` +
      '} WHERE {\n' +
      '?mainRes a knora-api:Resource .\n' +
      `${this._restrictToResourceClassStatement()}\n` +
      `${whereClause}\n` +
      '}\n' +
      `${this._getOrderByString(statements)}\n` +
      'OFFSET 0';

    return gravSearch;
  }

  private _buildConstructStatements(statements: StatementElement[]): string {
    const writer = new GravsearchWriter(statements);
    return statements.map((_, i) => writer.at(i).constructStatement).join('\n');
  }

  private _buildWhereClause(statements: StatementElement[]): string {
    const writer = new GravsearchWriter(statements);
    return statements.map((_, i) => writer.at(i).whereStatement).join('\n');
  }

  /**
   *
   * @param property the PropertyFormItem to create the value string for
   * @param index index of the property in the properties list
   * @param identifier indentifier for the property, either ?prop or ?linkProp + index
   * @param labelRes variable name for which resource the label is searched on, either ?mainRes or ?prop + index
   * @returns a gravsearch value string
   */
  private _valueStringHelper(property: StatementElement, index: number, identifier: string, labelRes: string): string {
    // if the property is a child property, a linked resource, and the operator is equals or not equals, return an empty string
    if (
      !property.selectedPredicate?.objectValueType.includes(Constants.KnoraApiV2) &&
      (property.selectedOperator === Operator.Equals || property.selectedOperator === Operator.NotEquals)
    )
      return '';

    // add first 8 characters of the property id to create unique identifier for the variable name when searching for a resource label
    // it's sliced because gravsearch doesn't allow minus signs in variable names
    const labelVariableName = `?label${property.id.slice(0, 8)}`;

    // linked resource
    if (!property.selectedPredicate?.objectValueType.includes(Constants.KnoraApiV2)) {
      switch (property.selectedOperator) {
        case Operator.Equals:
          return `?mainRes <${property.selectedPredicate?.iri}> <${property.selectedObjectNode?.writeValue}> .`;
        case Operator.NotEquals:
          // this looks wrong but it is correct
          return `FILTER NOT EXISTS { \n?mainRes <${property.selectedPredicate?.iri}> <${property.selectedObjectNode?.writeValue}> . }`;
        case Operator.Matches:
          return '';
        default:
          throw new Error('Invalid operator for linked resource');
      }
    } else {
      switch (property.selectedPredicate?.objectValueType) {
        // RESOURCE LABEL
        case ResourceLabel:
          switch (property.selectedOperator) {
            case Operator.Equals:
            case Operator.NotEquals:
              return (
                `${labelRes} rdfs:label ${labelVariableName} .\n` +
                `FILTER (${labelVariableName} ${this._operatorToSymbol(property.selectedOperator)} "${
                  property.selectedObjectNode?.writeValue
                }") .`
              );
            case Operator.IsLike:
              return (
                `${labelRes} rdfs:label ${labelVariableName} .\n` +
                `FILTER regex(${labelVariableName}, "${property.selectedObjectNode?.writeValue}", "i") .`
              );
            case Operator.Matches:
              return (
                `${labelRes} rdfs:label ${labelVariableName} .\n` +
                `FILTER knora-api:matchLabel(${labelRes}, "${property.selectedObjectNode?.writeValue}") .`
              );
            default:
              throw new Error('Invalid operator for resource label');
          }
        case Constants.TextValue:
          switch (property.selectedOperator) {
            case Operator.Equals:
            case Operator.NotEquals:
              return (
                `${identifier}${index} <${Constants.ValueAsString}> ${identifier}${index}Literal .\n` +
                `FILTER (${identifier}${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${
                  property.selectedObjectNode?.writeValue
                }"^^<${Constants.XsdString}>) .`
              );
            case Operator.IsLike:
              return (
                `${identifier}${index} <${Constants.ValueAsString}> ${identifier}${index}Literal .\n` +
                `FILTER ${this._operatorToSymbol(property.selectedOperator)}(${identifier}${index}Literal, "${
                  property.selectedObjectNode?.writeValue
                }"^^<${Constants.XsdString}>, "i") .`
              );
            case Operator.Matches:
              return `FILTER <${this._operatorToSymbol(property.selectedOperator)}>(${identifier}${index}, "${
                property.selectedObjectNode?.writeValue
              }"^^<${Constants.XsdString}>) .`;
            default:
              throw new Error('Invalid operator for text value');
          }
        case Constants.IntValue:
          return (
            `${identifier}${index} <${Constants.IntValueAsInt}> ${identifier}${index}Literal .\n` +
            `FILTER (${identifier}${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${
              property.selectedObjectNode?.writeValue
            }"^^<${Constants.XsdInteger}>) .`
          );
        case Constants.DecimalValue:
          return (
            `${identifier}${index} <${Constants.DecimalValueAsDecimal}> ${identifier}${index}Literal .\n` +
            `FILTER (${identifier}${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${
              property.selectedObjectNode?.writeValue
            }"^^<${Constants.XsdDecimal}>) .`
          );
        case Constants.BooleanValue:
          return (
            `${identifier}${index} <${Constants.BooleanValueAsBoolean}> ${identifier}${index}Literal .\n` +
            `FILTER (${identifier}${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${
              property.selectedObjectNode?.writeValue
            }"^^<${Constants.XsdBoolean}>) .`
          );
        case Constants.DateValue:
          return `FILTER(knora-api:toSimpleDate(${identifier}${index}) ${this._operatorToSymbol(
            property.selectedOperator
          )} "${property.selectedObjectNode?.writeValue}"^^<${Constants.KnoraApi}/ontology/knora-api/simple/v2${
            Constants.HashDelimiter
          }Date>) .`;

        case Constants.ListValue:
          switch (property.selectedOperator) {
            case Operator.NotEquals: {
              const listValueAsListNode = Constants.ListValueAsListNode.split('#').pop();
              return (
                `${identifier}${index} knora-api:${listValueAsListNode} ${identifier}${index}List .\n` +
                `FILTER NOT EXISTS { ${identifier}${index} knora-api:${listValueAsListNode} <${property.selectedObjectNode?.writeValue}> . }`
              );
            }
            default:
              return `${identifier}${index} <${Constants.ListValueAsListNode}> <${property.selectedObjectNode?.writeValue}> .\n`;
          }
        case Constants.UriValue:
          return (
            `${identifier}${index} <${Constants.UriValueAsUri}> ${identifier}${index}Literal .\n` +
            `FILTER (${identifier}${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${
              property.selectedObjectNode
            }"^^<${Constants.XsdAnyUri}>) .`
          );
        default:
          throw new Error('Invalid object type');
      }
    }
  }

  private _restrictToResourceClassStatement() {
    return this._searchStateService.currentState.selectedResourceClass?.iri
      ? `?mainRes a <${this._searchStateService.currentState.selectedResourceClass?.iri}> .`
      : this.dataService.classIris
          .map(resourceClass => `{ ?mainRes a ${this.ontoShortCode}:${resourceClass.split('#').pop()} . }`)
          .join(' UNION ');
  }

  private _getOrderByString(statements: StatementElement[]): string {
    const orderByProps: string[] = this._searchStateService.currentState.orderBy
      .filter(o => o.orderBy)
      .map(o => {
        const index = statements.findIndex(stm => stm.id === o.id);
        return `?res${index}`;
      });

    return orderByProps.length ? `ORDER BY ${orderByProps.join(' ')}` : '';
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
