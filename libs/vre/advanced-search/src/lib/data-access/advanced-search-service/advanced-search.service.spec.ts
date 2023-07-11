import { TestBed } from '@angular/core/testing';

import { AdvancedSearchService } from './advanced-search.service';

describe('AdvancedSearchService', () => {
  let service: AdvancedSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvancedSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
