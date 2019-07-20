import { TestBed } from '@angular/core/testing';

import { SourceTypeFormService } from './source-type-form.service';

describe('SourceTypeFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SourceTypeFormService = TestBed.get(SourceTypeFormService);
    expect(service).toBeTruthy();
  });
});
