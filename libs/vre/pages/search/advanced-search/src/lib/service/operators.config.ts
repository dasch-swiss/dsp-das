import { Constants } from '@dasch-swiss/dsp-js';
import { ResourceLabel } from '../model';

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

const BASIC_OPS = [Operators.Equals, Operators.NotEquals, Operators.Exists, Operators.NotExists] as const;
const TEXT_OPS = [...BASIC_OPS, Operators.IsLike, Operators.Matches] as const;
const NUMERIC_OPS = [
  ...BASIC_OPS,
  Operators.GreaterThan,
  Operators.GreaterThanEquals,
  Operators.LessThan,
  Operators.LessThanEquals,
] as const;
const EXISTENCE_OPS = [Operators.Exists, Operators.NotExists] as const;
const LINKED_RESOURCE_OPS = [...BASIC_OPS, Operators.Matches] as const;

export const SPECIAL_VALUE_OPERATORS = {
  [ResourceLabel]: TEXT_OPS,
  [Constants.TextValue]: TEXT_OPS,

  [Constants.IntValue]: NUMERIC_OPS,
  [Constants.DecimalValue]: NUMERIC_OPS,
  [Constants.DateValue]: NUMERIC_OPS,

  [Constants.BooleanValue]: BASIC_OPS,
  [Constants.UriValue]: BASIC_OPS,
  [Constants.ListValue]: BASIC_OPS,

  [Constants.LinkValue]: LINKED_RESOURCE_OPS,
} as const;

export const getOperatorsForObjectType = (objectType: string) => SPECIAL_VALUE_OPERATORS[objectType] ?? EXISTENCE_OPS;
