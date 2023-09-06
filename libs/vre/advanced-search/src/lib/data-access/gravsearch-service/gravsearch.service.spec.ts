import { TestBed } from '@angular/core/testing';

import { GravsearchService } from './gravsearch.service';
import { Operators } from '../advanced-search-store/advanced-search-store.service';
import { ResourceLabel } from '../advanced-search-service/advanced-search.service';
import { Constants } from '@dasch-swiss/dsp-js';

describe('GravsearchService', () => {
    let service: GravsearchService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GravsearchService);
        expect(service).toBeTruthy();
    });

    describe('getGravsearchQuery', () => {
        it('should return a gravsearch query', () => {
            const query = service.generateGravSearchQuery(
                'http://api.test.dasch.swiss/ontology/0420/eric-onto/v2#test',
                [
                    {
                        id: 'd708083b-d670-46d8-a4ea-5c106ffa49b4',
                        operators: [Operators.Equals, Operators.NotEquals, Operators.IsLike, Operators.Matches],
                        selectedOperator: 'equals',
                        selectedProperty: {
                            iri: 'http://api.test.dasch.swiss/ontology/0420/eric-onto/v2#test',
                            label: 'test',
                            objectType: ResourceLabel,
                            isLinkedResourceProperty: false,
                        },
                        searchValue: 'test',
                        list: undefined,
                    },
                    {
                        id: '555303d5-fd4f-4b71-8361-6d6abb8c9387',
                        operators: [Operators.Equals, Operators.NotEquals, Operators.Exists, Operators.NotExists, Operators.GreaterThan, Operators.GreaterThanEquals, Operators.LessThan, Operators.LessThanEquals],
                        selectedOperator: Operators.Exists,
                        selectedProperty: {
                            iri: 'http://api.test.dasch.swiss/ontology/0420/eric-onto/v2#int',
                            label: 'int',
                            objectType: Constants.IntValue,
                            isLinkedResourceProperty: false,
                        },
                        searchValue: 'test',
                        list: undefined,
                    },
                    {
                        id: '852c1fb3-2ed2-404c-9fe4-5ada9f97578f',
                        operators: [Operators.Equals, Operators.NotEquals, Operators.Exists, Operators.NotExists, Operators.GreaterThan, Operators.GreaterThanEquals, Operators.LessThan, Operators.LessThanEquals],
                        selectedOperator: Operators.LessThan,
                        selectedProperty: {
                            iri: 'http://api.test.dasch.swiss/ontology/0420/eric-onto/v2#dectest',
                            label: 'dectest',
                            objectType: Constants.DecimalValue,
                            isLinkedResourceProperty: false,
                        },
                        searchValue: '1',
                        list: undefined,
                    },
                ],
                [],
            );

            expect(query).toEqual(
`PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>
CONSTRUCT {
?mainRes knora-api:isMainResource true .

?mainRes <http://api.test.dasch.swiss/ontology/0420/eric-onto/v2#int> ?prop1 .
?mainRes <http://api.test.dasch.swiss/ontology/0420/eric-onto/v2#dectest> ?prop2 .
} WHERE {
?mainRes a knora-api:Resource .
?mainRes a <http://api.test.dasch.swiss/ontology/0420/eric-onto/v2#test> .
?mainRes rdfs:label ?label .
FILTER (?label = "test") .
?mainRes <http://api.test.dasch.swiss/ontology/0420/eric-onto/v2#int> ?prop1 .
?mainRes <http://api.test.dasch.swiss/ontology/0420/eric-onto/v2#dectest> ?prop2 .?prop2 <http://api.knora.org/ontology/knora-api/v2#decimalValueAsDecimal> ?prop2Literal .
FILTER (?prop2Literal < "1"^^<http://www.w3.org/2001/XMLSchema#decimal>) .
}

OFFSET 0`
            );
        });
    });
});
