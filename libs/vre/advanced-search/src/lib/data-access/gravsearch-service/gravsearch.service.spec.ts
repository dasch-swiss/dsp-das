import { TestBed } from '@angular/core/testing';

import { GravsearchService } from './gravsearch.service';

describe('GravsearchService', () => {
  let service: GravsearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GravsearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
