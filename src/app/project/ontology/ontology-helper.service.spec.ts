import { TestBed } from '@angular/core/testing';

import { OntologyHelperService } from './ontology-helper.service';

describe('OntologyHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OntologyHelperService = TestBed.get(OntologyHelperService);
    expect(service).toBeTruthy();
  });
});
