import { Constants } from '@dasch-swiss/dsp-js';
import { ResourceLabel } from '../model';

// 1) Define operators as const literals
export const OPERATORS = {
  Equals: 'equals',
  NotEquals: 'does not equal',
  Exists: 'exists',
  NotExists: 'does not exist',
  GreaterThan: 'greater than',
  GreaterThanEquals: 'greater than or equal to',
  LessThan: 'less than',
  LessThanEquals: 'less than or equal to',
  IsLike: 'is like',
  Matches: 'matches',
} as const;

export type Operator = keyof typeof OPERATORS;
export type OperatorLabel = Operator[keyof Operator];

export const OPERATORS_MAP = new Map<string, OperatorLabel[]>([
  [
    OPERATORS.Equals,
    [
      ResourceLabel,
      Constants.TextValue,
      Constants.IntValue,
      Constants.DecimalValue,
      Constants.BooleanValue,
      Constants.DateValue,
      Constants.UriValue,
      Constants.ListValue,
    ],
  ],
  [
    OPERATORS.NotEquals,
    [
      ResourceLabel,
      Constants.TextValue,
      Constants.IntValue,
      Constants.DecimalValue,
      Constants.DateValue,
      Constants.UriValue,
      Constants.ListValue,
    ],
  ],
  [
    OPERATORS.Exists,
    [
      Constants.TextValue,
      Constants.IntValue,
      Constants.DecimalValue,
      Constants.BooleanValue,
      Constants.DateValue,
      Constants.UriValue,
      Constants.ListValue,
      Constants.GeomValue,
      Constants.FileValue,
      Constants.AudioFileValue,
      Constants.StillImageFileValue,
      Constants.DDDFileValue,
      Constants.MovingImageFileValue,
      Constants.TextFileValue,
      Constants.ColorValue,
      Constants.IntervalValue,
      Constants.GeonameValue,
      Constants.TimeValue,
    ],
  ],
  [
    OPERATORS.NotExists,
    [
      Constants.TextValue,
      Constants.IntValue,
      Constants.DecimalValue,
      Constants.BooleanValue,
      Constants.DateValue,
      Constants.UriValue,
      Constants.ListValue,
      Constants.GeomValue,
      Constants.FileValue,
      Constants.AudioFileValue,
      Constants.StillImageFileValue,
      Constants.DDDFileValue,
      Constants.MovingImageFileValue,
      Constants.TextFileValue,
      Constants.ColorValue,
      Constants.IntervalValue,
      Constants.GeonameValue,
      Constants.TimeValue,
    ],
  ],
  [OPERATORS.GreaterThan, [Constants.IntValue, Constants.DecimalValue, Constants.DateValue]],
  [OPERATORS.GreaterThanEquals, [Constants.IntValue, Constants.DecimalValue, Constants.DateValue]],
  [OPERATORS.LessThan, [Constants.IntValue, Constants.DecimalValue, Constants.DateValue]],
  [OPERATORS.LessThanEquals, [Constants.IntValue, Constants.DecimalValue, Constants.DateValue]],
  [OPERATORS.IsLike, [ResourceLabel, Constants.TextValue]],
  [OPERATORS.Matches, [ResourceLabel, Constants.TextValue]],
]);

export function getOperatorsForObjectType(objectType: string): string[] {
  return Array.from(OPERATORS_MAP.entries())
    .filter(([, allowedTypes]) => allowedTypes.includes(objectType))
    .map(([operator]) => operator);
}

export function getDefaultLinkedResourceOperators(): string[] {
  return [OPERATORS.Equals, OPERATORS.NotEquals, OPERATORS.Exists, OPERATORS.NotExists, OPERATORS.Matches];
}
