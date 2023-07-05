import { TestBed } from '@angular/core/testing';

import { AdvancedSearchStoreService } from './advanced-search-store.service';

describe('AdvancedSearchStoreService', () => {
  let service: AdvancedSearchStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvancedSearchStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
