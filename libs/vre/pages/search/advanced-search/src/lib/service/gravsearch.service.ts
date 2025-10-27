import { inject, Injectable } from '@angular/core';
import { Constants } from '@dasch-swiss/dsp-js';
import { ResourceLabel } from '../constants';
import { GravsearchPropertyString, OrderByItem, PropertyFormItem } from '../model';
import { AdvancedSearchDataService } from './advanced-search-data.service';
import { Operator } from './operators.config';

@Injectable()
export class GravsearchService {
  private dataService: AdvancedSearchDataService = inject(AdvancedSearchDataService);

  generateGravSearchQuery(
    resourceClassIri: string | undefined,
    properties: PropertyFormItem[],
    orderByList: OrderByItem[]
  ): string {
    // class restriction for the resource searched for
    let restrictToResourceClass = '';

    // Safety check for ontoIri
    const ontoIri = this.dataService.selectedOntology?.iri;
    const resourceClasses = this.dataService.classIris;

    const ontoShortCodeMatch = ontoIri.match(/\/([^/]+)\/v2$/);
    if (!ontoShortCodeMatch) {
      throw new Error(`Invalid ontology IRI format: ${ontoIri}`);
    }
    const ontoShortCode = ontoShortCodeMatch[1];

    // if given, create the class restriction for the main resource
    restrictToResourceClass =
      resourceClassIri !== undefined
        ? `?mainRes a <${resourceClassIri}> .`
        : resourceClasses
            .map(resourceClass => `{ ?mainRes a ${ontoShortCode}:${resourceClass.split('#').pop()} . }`)
            .join(' UNION ');

    const propertyStrings: GravsearchPropertyString[] = properties.map((prop, index) =>
      this._propertyStringHelper(prop, index)
    );

    let orderByString = '';
    const orderByProps: string[] = [];

    // use the id in the orderByList to loop through properties to find the index of the property in the properties list
    // then add the string with the index to orderByProps
    orderByList
      .filter(orderByItem => orderByItem.orderBy === true)
      .forEach(orderByItem => {
        const index = properties.findIndex(prop => prop.id === orderByItem.id);
        if (index > -1) {
          if (properties[index].selectedProperty?.objectType === ResourceLabel) {
            // add first 8 characters of the property id to create unique identifier for the variable name when searching for a resource label
            // it's sliced because gravsearch doesn't allow minus signs in variable names
            orderByProps.push(`?label${properties[index].id.slice(0, 8)}`);
          } else {
            orderByProps.push(`?prop${index}`);
          }
        }
      });

    orderByString = orderByProps.length ? `ORDER BY ${orderByProps.join(' ')}` : '';

    const gravSearch =
      'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\n' +
      `PREFIX ${ontoShortCode}: <${ontoIri}#>\n` +
      'CONSTRUCT {\n' +
      '?mainRes knora-api:isMainResource true .\n' +
      `${propertyStrings.map(prop => prop.constructString).join('\n')}\n` +
      '} WHERE {\n' +
      '?mainRes a knora-api:Resource .\n' +
      `${restrictToResourceClass}\n` +
      `${propertyStrings.map(prop => prop.whereString).join('\n')}\n` +
      '}\n' +
      `${orderByString}\n` +
      'OFFSET 0';

    return gravSearch;
  }

  private _propertyStringHelper(property: PropertyFormItem, index: number): GravsearchPropertyString {
    let constructString = '';
    let whereString = '';

    // not a linked resource, not a resource label
    if (
      property.selectedProperty?.objectType.includes(Constants.KnoraApiV2) &&
      property.selectedProperty?.objectType !== ResourceLabel
    ) {
      constructString = `?mainRes <${property.selectedProperty?.iri}> ?prop${index} .`;
      whereString = constructString;
    }

    // linked resource
    if (
      !property.selectedProperty?.objectType.includes(Constants.KnoraApiV2) &&
      property.selectedProperty?.objectType !== ResourceLabel
    ) {
      if (property.selectedOperator !== Operator.NotEquals) {
        constructString = `?mainRes <${property.selectedProperty?.iri}> ?prop${index} .`;
        whereString = constructString;
      }
      // if search value is an array that means that it's a linked resource with child properties
      if (Array.isArray(property.searchValue)) {
        property.searchValue.forEach((value, i) => {
          if (value.selectedProperty?.objectType !== ResourceLabel) {
            if (value.selectedOperator === Operator.NotExists) {
              constructString += `\n?prop${index} <${value.selectedProperty?.iri}> ?linkProp${index}${i} .`;
              whereString +=
                '\nFILTER NOT EXISTS { \n' +
                `?prop${index} <${value.selectedProperty?.iri}> ?linkProp${index}${i} .\n` +
                '}\n';
            } else if (
              // searching for a resource class
              value.selectedOperator === Operator.Equals &&
              !value.selectedProperty?.objectType.includes(Constants.KnoraApiV2)
            ) {
              constructString += `\n?prop${index} <${value.selectedProperty?.iri}> <${value.searchValue}> .`;
              whereString += `\n?prop${index} <${value.selectedProperty?.iri}> <${value.searchValue}> .\n`;
              whereString += `\n?prop${index} a <${property.selectedMatchPropertyResourceClass?.iri}> .\n`;
            } else if (
              // searching for a resource class
              value.selectedOperator === Operator.NotEquals &&
              !value.selectedProperty?.objectType.includes(Constants.KnoraApiV2)
            ) {
              constructString += `\n?prop${index} <${value.selectedProperty?.iri}> <${value.searchValue}> .`;
              whereString +=
                '\nFILTER NOT EXISTS { \n' +
                `\n?prop${index} <${value.selectedProperty?.iri}> <${value.searchValue}> .\n` +
                '}\n';
              whereString += `\n?prop${index} a <${property.selectedMatchPropertyResourceClass?.iri}> .\n`;
            } else {
              constructString += `\n?prop${index} <${value.selectedProperty?.iri}> ?linkProp${index}${i} .`;
              whereString += `\n?prop${index} <${value.selectedProperty?.iri}> ?linkProp${index}${i} .\n`;
            }
          }
        });
      }
    }

    if (!(property.selectedOperator === Operator.Exists || property.selectedOperator === Operator.NotExists)) {
      whereString += `\n${this._valueStringHelper(property, index, '?prop', '?mainRes')}`;
    } else if (property.selectedOperator === Operator.NotExists) {
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
  private _valueStringHelper(property: PropertyFormItem, index: number, identifier: string, labelRes: string): string {
    // if the property is a child property, a linked resource, and the operator is equals or not equals, return an empty string
    if (
      property.isChildProperty &&
      !property.selectedProperty?.objectType.includes(Constants.KnoraApiV2) &&
      (property.selectedOperator === Operator.Equals || property.selectedOperator === Operator.NotEquals)
    )
      return '';

    // add first 8 characters of the property id to create unique identifier for the variable name when searching for a resource label
    // it's sliced because gravsearch doesn't allow minus signs in variable names
    const labelVariableName = `?label${property.id.slice(0, 8)}`;

    // linked resource
    if (!property.selectedProperty?.objectType.includes(Constants.KnoraApiV2)) {
      let valueString = '';
      switch (property.selectedOperator) {
        case Operator.Equals:
          return `?mainRes <${property.selectedProperty?.iri}> <${property.searchValue}> .`;
        case Operator.NotEquals:
          // this looks wrong but it is correct
          return `FILTER NOT EXISTS { \n?mainRes <${property.selectedProperty?.iri}> <${property.searchValue}> . }`;
        case Operator.Matches:
          if (Array.isArray(property.searchValue)) {
            property.searchValue.forEach((value, i) => {
              if (value.selectedOperator !== Operator.Exists && value.selectedOperator !== Operator.NotExists) {
                valueString += this._valueStringHelper(value, i, `?linkProp${index}`, `?prop${index}`);
              }
            });
          }
          return valueString;
        default:
          throw new Error('Invalid operator for linked resource');
      }
    } else {
      switch (property.selectedProperty?.objectType) {
        case ResourceLabel:
          switch (property.selectedOperator) {
            case Operator.Equals:
            case Operator.NotEquals:
              return (
                `${labelRes} rdfs:label ${labelVariableName} .\n` +
                `FILTER (${labelVariableName} ${this._operatorToSymbol(property.selectedOperator)} "${
                  property.searchValue
                }") .`
              );
            case Operator.IsLike:
              return (
                `${labelRes} rdfs:label ${labelVariableName} .\n` +
                `FILTER regex(${labelVariableName}, "${property.searchValue}", "i") .`
              );
            case Operator.Matches:
              return (
                `${labelRes} rdfs:label ${labelVariableName} .\n` +
                `FILTER knora-api:matchLabel(${labelRes}, "${property.searchValue}") .`
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
                  property.searchValue
                }"^^<${Constants.XsdString}>) .`
              );
            case Operator.IsLike:
              return (
                `${identifier}${index} <${Constants.ValueAsString}> ${identifier}${index}Literal .\n` +
                `FILTER ${this._operatorToSymbol(property.selectedOperator)}(${identifier}${index}Literal, "${
                  property.searchValue
                }"^^<${Constants.XsdString}>, "i") .`
              );
            case Operator.Matches:
              return `FILTER <${this._operatorToSymbol(property.selectedOperator)}>(${identifier}${index}, "${
                property.searchValue
              }"^^<${Constants.XsdString}>) .`;
            default:
              throw new Error('Invalid operator for text value');
          }
        case Constants.IntValue:
          return (
            `${identifier}${index} <${Constants.IntValueAsInt}> ${identifier}${index}Literal .\n` +
            `FILTER (${identifier}${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${
              property.searchValue
            }"^^<${Constants.XsdInteger}>) .`
          );
        case Constants.DecimalValue:
          return (
            `${identifier}${index} <${Constants.DecimalValueAsDecimal}> ${identifier}${index}Literal .\n` +
            `FILTER (${identifier}${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${
              property.searchValue
            }"^^<${Constants.XsdDecimal}>) .`
          );
        case Constants.BooleanValue:
          return (
            `${identifier}${index} <${Constants.BooleanValueAsBoolean}> ${identifier}${index}Literal .\n` +
            `FILTER (${identifier}${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${
              property.searchValue
            }"^^<${Constants.XsdBoolean}>) .`
          );
        case Constants.DateValue:
          return `FILTER(knora-api:toSimpleDate(${identifier}${index}) ${this._operatorToSymbol(
            property.selectedOperator
          )} "${property.searchValue}"^^<${Constants.KnoraApi}/ontology/knora-api/simple/v2${
            Constants.HashDelimiter
          }Date>) .`;
        case Constants.ListValue:
          switch (property.selectedOperator) {
            case Operator.NotEquals: {
              const listValueAsListNode = Constants.ListValueAsListNode.split('#').pop();
              return (
                `${identifier}${index} knora-api:${listValueAsListNode} ${identifier}${index}List .\n` +
                `FILTER NOT EXISTS { ${identifier}${index} knora-api:${listValueAsListNode} <${property.searchValue}> . }`
              );
            }
            default:
              return `${identifier}${index} <${Constants.ListValueAsListNode}> <${property.searchValue}> .\n`;
          }
        case Constants.UriValue:
          return (
            `${identifier}${index} <${Constants.UriValueAsUri}> ${identifier}${index}Literal .\n` +
            `FILTER (${identifier}${index}Literal ${this._operatorToSymbol(property.selectedOperator)} "${
              property.searchValue
            }"^^<${Constants.XsdAnyUri}>) .`
          );
        default:
          throw new Error('Invalid object type');
      }
    }
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
