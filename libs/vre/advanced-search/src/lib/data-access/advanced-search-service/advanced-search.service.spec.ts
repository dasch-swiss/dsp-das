import { TestBed } from '@angular/core/testing';

import { AdvancedSearchService } from './advanced-search.service';
import {
    KnoraApiConfig,
    KnoraApiConnection,
} from '@dasch-swiss/dsp-js';
import {
    DspApiConfigToken,
    DspApiConnectionToken,
} from '@dasch-swiss/vre/shared/app-config';
import { of } from 'rxjs';

describe('AdvancedSearchService', () => {
    let service: AdvancedSearchService;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: DspApiConfigToken,
                    useValue: new KnoraApiConfig('http', '0.0.0.0', 3333),
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: new KnoraApiConnection(
                        new KnoraApiConfig('http', '0.0.0.0', 3333)
                    ),
                },
            ],
        });
        service = TestBed.inject(AdvancedSearchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('ontologies', () => {
        it('should return a list of ontologies', (done) => {
            const mockOntologiesResponse = {
                ontologies: [
                    {
                        id: 'ontology1',
                        label: 'Ontology 1',
                        attachedToProject: 'project1',
                    },
                    {
                        id: 'ontology2',
                        label: 'Ontology 2',
                        attachedToProject: 'project2',
                    },
                ],
            };

            // Mock the API call using a mock value
            const mockDspApiConnection = {
                v2: {
                    onto: {
                        getOntologiesMetadata: jest
                            .fn()
                            .mockReturnValue(of(mockOntologiesResponse)),
                    },
                },
            };

            // Use type assertion to bypass type checking for the mock connection
            service['_dspApiConnection'] = mockDspApiConnection as any;

            service.allOntologiesList().subscribe((ontologies) => {
                expect(ontologies).toEqual([
                    { iri: 'ontology1', label: 'Ontology 1' },
                    { iri: 'ontology2', label: 'Ontology 2' },
                ]);
                done();
            });
        });
    });
});
