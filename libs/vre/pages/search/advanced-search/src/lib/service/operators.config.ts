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

export const OPERATORS_MAP = new Map<string, string[]>([
  [
    Operators.Equals,
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
    Operators.NotEquals,
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
    Operators.Exists,
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
    Operators.NotExists,
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
  [Operators.GreaterThan, [Constants.IntValue, Constants.DecimalValue, Constants.DateValue]],
  [Operators.GreaterThanEquals, [Constants.IntValue, Constants.DecimalValue, Constants.DateValue]],
  [Operators.LessThan, [Constants.IntValue, Constants.DecimalValue, Constants.DateValue]],
  [Operators.LessThanEquals, [Constants.IntValue, Constants.DecimalValue, Constants.DateValue]],
  [Operators.IsLike, [ResourceLabel, Constants.TextValue]],
  [Operators.Matches, [ResourceLabel, Constants.TextValue]],
]);

export function getOperatorsForObjectType(objectType: string): string[] {
  return Array.from(OPERATORS_MAP.entries())
    .filter(([, allowedTypes]) => allowedTypes.includes(objectType))
    .map(([operator]) => operator);
}

export function getDefaultLinkedResourceOperators(): string[] {
  return [Operators.Equals, Operators.NotEquals, Operators.Exists, Operators.NotExists, Operators.Matches];
}
