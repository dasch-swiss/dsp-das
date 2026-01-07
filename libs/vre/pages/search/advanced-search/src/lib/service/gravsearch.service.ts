import { inject, Injectable } from '@angular/core';
import { Constants } from '@dasch-swiss/dsp-js';
import { ResourceLabel } from '../constants';
import { GravsearchStatement, GravsearchWriter, StatementElement } from '../model';
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
    const propertyStrings: GravsearchStatement[] = statements.map((stm, index) =>
      this._propertyStringHelper(stm, index)
    );

    const constructStatements = this._buildConstructStatements(statements);
    const whereClause = this._buildWhereClause(statements);

    const gravSearch2 =
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

    return gravSearch2;

    const gravSearch =
      'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\n' +
      `PREFIX ${this.ontoShortCode}: <${this.ontoIri}#>\n` +
      'CONSTRUCT {\n' +
      '?mainRes knora-api:isMainResource true .\n' +
      `${propertyStrings.map(prop => prop.constructString).join('\n')}\n` +
      '} WHERE {\n' +
      '?mainRes a knora-api:Resource .\n' +
      `${this._restrictToResourceClassStatement()}\n` +
      `${propertyStrings.map(prop => prop.whereString).join('\n')}\n` +
      '}\n' +
      `${this._getOrderByString(statements)}\n` +
      'OFFSET 0';

    return gravSearch;
  }

  private _buildConstructStatements(statements: StatementElement[]): string {
    const writer = new GravsearchWriter(statements);
    return statements.map((_, i) => writer.at(i).constructStatement).join('\n');
  }

  private _getConstructStatement(statement: StatementElement, index: number): string {
    const s = this._getSubjectIdentifier(statement);
    const o = this._getConstructObject(statement, index);
    return `${s} <${statement.selectedPredicate?.iri}> ${o} .`;
  }

  private _getSubjectIdentifier(statement: StatementElement): string {
    if (!statement.isChildProperty) {
      return '?mainRes';
    }
    const subjectId = statement.parentId || statement.id;
    const subjectWriteIndex = this._searchStateService.validStatementElements.findIndex(stm => stm.id === subjectId);
    return `?res${subjectWriteIndex}`;
  }

  private _getConstructObject(statement: StatementElement, index: number): string {
    if (!statement.isChildProperty) {
      return `?res${index}`;
    }
    if (
      (statement.selectedOperator === Operator.Equals || statement.selectedOperator === Operator.NotEquals) &&
      !statement.selectedPredicate?.objectValueType.includes(Constants.KnoraApiV2)
    ) {
      return `<${statement.selectedObjectNode?.writeValue}>`;
    }
  }

  /// if (
  //       statement.objectType === PropertyObjectType.ValueObject &&
  //       statement.selectedPredicate?.objectValueType === ResourceLabel
  //     ) {
  //       console.log('adding regex for resource label');
  //       let s = `${this._getSubjectIdentifier(statement)} rdfs:label ?label${statement.id.slice(0, 8)} .`;
  //       s += `\nFILTER regex(?label${statement.id.slice(0, 8)}, "${statement.selectedObjectNode?.writeValue}", "i") .\n`;
  //       return s;
  //     }
  //

  private _buildWhereClause(statements: StatementElement[]): string {
    const writer = new GravsearchWriter(statements);
    return statements.map((_, i) => writer.at(i).whereStatement).join('\n');
  }

  private _buildWhereStatementForLabelComparison(statement: StatementElement, index: number): string {
    let s = `${this._getSubjectIdentifier(statement)} rdfs:label ?label${statement.id.slice(0, 8)} .`;
    switch (statement.selectedOperator) {
      case Operator.Equals: // FILTER (?labelc71f50d2 = "G1512_H.") .
        s += `\nFILTER (?label${statement.id.slice(0, 8)} = "${statement.selectedObjectNode?.writeValue}") .\n`;
        return s;
      case Operator.NotEquals: // FILTER (?labelc71f50d2 != "G1512_H.") .
        s += `\nFILTER (?label${statement.id.slice(0, 8)} != "${statement.selectedObjectNode?.writeValue}") .\n`;
        return s;
      case Operator.Matches:
        s += `\nFILTER knora-api:matchLabel(${this._getSubjectIdentifier(
          statement
        )}, "${statement.selectedObjectNode?.writeValue}") .\n`;
        return s;
      case Operator.IsLike:
        s += `\nFILTER regex(?label${statement.id.slice(0, 8)}, "${statement.selectedObjectNode?.writeValue}", "i") .\n`;
        return s;
      default:
        return '';
    }
  }

  _buildWhereStatementForListObjectComparison(statement: StatementElement, index: number): string {
    let whereStm = this._getConstructStatement(statement, index);
    const o = this._getConstructObject(statement, index);

    const listValueAsListNode = Constants.ListValueAsListNode.split('#').pop();

    if (statement.selectedOperator === Operator.NotEquals) {
      whereStm += `\nFILTER NOT EXISTS { ${o} knora-api:${listValueAsListNode} <${statement.selectedObjectNode?.writeValue}> . }`;
    }
    if (statement.selectedOperator === Operator.Equals || statement.selectedOperator === Operator.Matches) {
      whereStm += `\n${o} knora-api:${listValueAsListNode} <${statement.selectedObjectNode?.writeValue}> .`;
    }

    if (statement.selectedOperator === Operator.NotExists) {
      whereStm = `FILTER NOT EXISTS { \n${whereStm}\n}\n`;
    }
    return whereStm;
  }

  private _buildWhereStatement(statement: StatementElement, index: number): string {
    let whereStm = this._getConstructStatement(statement, index);
    console.log(statement);
    if (
      (statement.selectedOperator === Operator.Equals || statement.selectedOperator === Operator.NotEquals) &&
      !statement.selectedPredicate?.isKnoraValueType
    ) {
      // add the statement for the resource class
      const s = this._getSubjectIdentifier(statement);
      whereStm += `\n?${s} a <${statement.selectedObjectNode?.writeValue}> .\n`;
    }

    if (statement.selectedOperator === Operator.NotExists || statement.selectedOperator === Operator.NotEquals) {
      // simply wrap everything into FILTER NOT EXISTS
      whereStm = `FILTER NOT EXISTS { \n${whereStm}\n}\n`;
    }

    return whereStm;
  }

  private _propertyStringHelper(statement: StatementElement, index: number): GravsearchStatement {
    let constructString = '';
    let whereString = '';

    // not a linked resource, not a resource label
    if (
      statement.selectedPredicate?.objectValueType.includes(Constants.KnoraApiV2) &&
      statement.selectedPredicate?.objectValueType !== ResourceLabel
    ) {
      constructString = `?mainRes <${statement.selectedPredicate?.iri}> ?prop${index} .`;
      whereString = constructString;
    }

    // linked resource
    if (
      !statement.selectedPredicate?.objectValueType.includes(Constants.KnoraApiV2) &&
      statement.selectedPredicate?.objectValueType !== ResourceLabel
    ) {
      if (statement.selectedOperator !== Operator.NotEquals) {
        constructString = `?mainRes <${statement.selectedPredicate?.iri}> ?prop${index} .`;
        whereString = constructString;
      }
      // if search value is an array that means that it's a linked resource with child properties
      //  TODO: CHANGE
      if (Array.isArray(statement.selectedObjectNode)) {
        statement.selectedObjectNode.forEach((value, i) => {
          if (value.selectedPredicate?.objectType !== ResourceLabel) {
            if (value.selectedOperator === Operator.NotExists) {
              constructString += `\n?prop${index} <${value.selectedPredicate?.iri}> ?linkProp${index}${i} .`;
              whereString +=
                '\nFILTER NOT EXISTS { \n' +
                `?prop${index} <${value.selectedPredicate?.iri}> ?linkProp${index}${i} .\n` +
                '}\n';
            } else if (
              // searching for a resource class
              value.selectedOperator === Operator.Equals &&
              !value.selectedPredicate?.objectType.includes(Constants.KnoraApiV2)
            ) {
              constructString += `\n?prop${index} <${value.selectedPredicate?.iri}> <${value.selectedObjectNode}> .`;
              whereString += `\n?prop${index} <${value.selectedPredicate?.iri}> <${value.selectedObjectNode}> .\n`;
              whereString += `\n?prop${index} a <${statement.selectedObjectNode?.writeValue}> .\n`;
            } else if (
              // searching for a resource class
              value.selectedOperator === Operator.NotEquals &&
              !value.selectedPredicate?.objectType.includes(Constants.KnoraApiV2)
            ) {
              constructString += `\n?prop${index} <${value.selectedPredicate?.iri}> <${value.selectedObjectNode}> .`;
              whereString +=
                '\nFILTER NOT EXISTS { \n' +
                `\n?prop${index} <${value.selectedPredicate?.iri}> <${value.selectedObjectNode}> .\n` +
                '}\n';
              whereString += `\n?prop${index} a <${statement.selectedObjectNode?.writeValue}> .\n`;
            } else {
              constructString += `\n?prop${index} <${value.selectedPredicate?.iri}> ?linkProp${index}${i} .`;
              whereString += `\n?prop${index} <${value.selectedPredicate?.iri}> ?linkProp${index}${i} .\n`;
            }
          }
        });
      }
    }

    if (!(statement.selectedOperator === Operator.Exists || statement.selectedOperator === Operator.NotExists)) {
      whereString += `\n${this._valueStringHelper(statement, index, '?prop', '?mainRes')}`;
    } else if (statement.selectedOperator === Operator.NotExists) {
      whereString = `FILTER NOT EXISTS { \n${whereString}\n}\n`;
    }

    return {
      constructString,
      whereString,
    };
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
    const orderByProps: string[] = [];

    // use the id in the orderByList to loop through properties to find the index of the property in the properties list
    // then add the string with the index to orderByProps
    this._searchStateService.currentState.orderBy
      .filter(orderByItem => orderByItem.orderBy === true)
      .forEach(orderByItem => {
        const index = statements.findIndex(stm => stm.id === orderByItem.id);
        if (index > -1) {
          if (statements[index].selectedPredicate?.objectValueType === ResourceLabel) {
            // add first 8 characters of the property id to create unique identifier for the variable name when searching for a resource label
            // it's sliced because gravsearch doesn't allow minus signs in variable names
            orderByProps.push(`?label${statements[index].id.slice(0, 8)}`);
          } else {
            orderByProps.push(`?prop${index}`);
          }
        }
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
