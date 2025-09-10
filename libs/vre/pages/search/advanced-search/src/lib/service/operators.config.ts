import { Constants } from '@dasch-swiss/dsp-js';
import { PropertyData } from '../model';
import { ResourceLabel } from '../constants';

export enum Operators {
  Equals = 'equals',
  NotEquals = 'does not equal',
  Exists = 'exists',
  NotExists = 'does not exist',
  GreaterThan = 'greater than',
  GreaterThanEquals = 'greater than or equal to',
  LessThan = 'less than',
  LessThanEquals = 'less than or equal to',
  IsLike = 'is like',
  Matches = 'matches',
}

export const BASIC_OPS = [Operators.Equals, Operators.NotEquals, Operators.Exists, Operators.NotExists];
export const TEXT_OPS = [...BASIC_OPS, Operators.IsLike, Operators.Matches];
export const NUMERIC_OPS = [
  ...BASIC_OPS,
  Operators.GreaterThan,
  Operators.GreaterThanEquals,
  Operators.LessThan,
  Operators.LessThanEquals,
] as const;
export const EXISTENCE_OPS = [Operators.Exists, Operators.NotExists];
export const LINKED_RESOURCE_OPS = [...BASIC_OPS, Operators.Matches];

export const SPECIAL_VALUE_OPERATORS = {
  [ResourceLabel]: TEXT_OPS,
  [Constants.TextValue]: TEXT_OPS,

  [Constants.IntValue]: NUMERIC_OPS,
  [Constants.DecimalValue]: NUMERIC_OPS,
  [Constants.DateValue]: NUMERIC_OPS,

  [Constants.BooleanValue]: BASIC_OPS,
  [Constants.UriValue]: BASIC_OPS,
  [Constants.ListValue]: BASIC_OPS,
} as const;

export const getOperatorsForObjectType = (property: PropertyData) =>
  property.isLinkedResourceProperty
    ? (LINKED_RESOURCE_OPS as Operators[])
    : ((SPECIAL_VALUE_OPERATORS[property.objectType] ?? EXISTENCE_OPS) as Operators[]);
