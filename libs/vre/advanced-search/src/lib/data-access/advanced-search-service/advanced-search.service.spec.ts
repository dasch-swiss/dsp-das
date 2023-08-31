import { TestBed } from '@angular/core/testing';

import { AdvancedSearchService } from './advanced-search.service';
import { KnoraApiConfig, KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConfigToken, DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
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
                    useValue: new KnoraApiConnection(new KnoraApiConfig('http', '0.0.0.0', 3333)),
                },
            ],
        });
        service = TestBed.inject(AdvancedSearchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return a list of projects', (done) => {
        const mockProjectsResponse = {
          body: {
            projects: [
              { id: 'project1', shortname: 'proj1' },
              { id: 'project2', shortname: 'proj2' },
            ],
          },
        };

        // Mock the API call using a mock value
        const mockDspApiConnection = {
          admin: {
            projectsEndpoint: {
              getProjects: jest.fn().mockReturnValue(of(mockProjectsResponse)),
            },
          },
        };

        // any is needed here so that we don't have to mock the entire DspApiConnection object
        service['_dspApiConnection'] = mockDspApiConnection as any;

        service.projectsList().subscribe((projects) => {
          expect(projects).toEqual([
            { iri: 'project1', label: 'proj1' },
            { iri: 'project2', label: 'proj2' },
          ]);
          done();
        });
      });
});
