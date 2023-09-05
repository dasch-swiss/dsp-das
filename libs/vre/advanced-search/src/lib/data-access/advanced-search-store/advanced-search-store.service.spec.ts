import { TestBed } from '@angular/core/testing';

import { AdvancedSearchStoreService } from './advanced-search-store.service';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { AdvancedSearchService } from '../advanced-search-service/advanced-search.service';
import { GravsearchService } from '../gravsearch-service/gravsearch.service';

export const DspApiConnectionToken = new InjectionToken<KnoraApiConnection>('DspApiConnectionToken');

@Injectable()
export class MockKnoraApiConnection {}

@Injectable()
export class MockAdvancedSearchService {
    constructor(@Inject(DspApiConnectionToken)private _knoraApiConnection: MockKnoraApiConnection) {}
}

@Injectable()
export class MockGravsearchService {}

describe('AdvancedSearchStoreService', () => {
    let service: AdvancedSearchStoreService;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                MockKnoraApiConnection,
                {
                    provide: DspApiConnectionToken,
                    useValue: new MockKnoraApiConnection(),
                },
                {
                    provide: AdvancedSearchService,
                    useClass: MockAdvancedSearchService,
                },
                {
                    provide: GravsearchService,
                    useClass: MockGravsearchService,
                },
                AdvancedSearchStoreService
            ],
        });
        service = TestBed.inject(AdvancedSearchStoreService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
