import { Constants } from '@dasch-swiss/dsp-js';

export class ComparisonOperatorConstants {

    static EqualsComparisonOperator = '=';
    static EqualsComparisonLabel = 'is equal to';

    static NotEqualsComparisonOperator = '!=';
    static NotEqualsComparisonLabel = 'is not equal to';

    static GreaterThanComparisonOperator = '>';
    static GreaterThanComparisonLabel = 'is greater than';

    static GreaterThanEqualsComparisonOperator = '>=';
    static GreaterThanEqualsComparisonLabel = 'is greater than or equal to';

    static LessThanComparisonOperator = '<';
    static LessThanComparisonLabel = 'is less than';

    static LessThanEqualsComparisonOperator = '<=';
    static LessThanQualsComparisonLabel = 'is less than or equal to';

    static ExistsComparisonOperator = 'E';
    static ExistsComparisonLabel = 'exists';

    static LikeComparisonOperator = 'regex';
    static LikeComparisonLabel = 'is like';

    static MatchComparisonOperator = 'contains';
    static MatchComparisonLabel = 'matches';

    static MatchFunction = Constants.KnoraApiV2 + Constants.HashDelimiter + 'matchText';
}
