import { Constants } from '@dasch-swiss/dsp-js';
import { ResourceLabel } from '../constants';
import { PropertyData } from '../model';

export enum Operator {
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

export const BASIC_OPS = [Operator.Equals, Operator.NotEquals, Operator.Exists, Operator.NotExists];
export const TEXT_OPS = [...BASIC_OPS, Operator.IsLike];
export const NUMERIC_OPS = [
  ...BASIC_OPS,
  Operator.GreaterThan,
  Operator.GreaterThanEquals,
  Operator.LessThan,
  Operator.LessThanEquals,
] as const;
export const EXISTENCE_OPS = [Operator.Exists, Operator.NotExists];
export const LINKED_RESOURCE_OPS = [...BASIC_OPS, Operator.Matches];

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
  property.isLinkProperty
    ? (LINKED_RESOURCE_OPS as Operator[])
    : ((SPECIAL_VALUE_OPERATORS[property.objectType] ?? EXISTENCE_OPS) as Operator[]);
