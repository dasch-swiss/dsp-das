import { TestBed } from '@angular/core/testing';
import { ReadProject } from '@dasch-swiss/dsp-js';
import { LegalInfoApiService, ProjectApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { of, ReplaySubject, throwError } from 'rxjs';
import { ProjectDataRightsService } from './project-data-rights.service';

describe('ProjectDataRightsService', () => {
  let service: ProjectDataRightsService;
  let projectApi: { get: jest.Mock };
  let legalInfoApi: { getLicenses: jest.Mock };

  const makeProject = (overrides: Partial<ReadProject> = {}): ReadProject =>
    ({
      id: 'http://rdfh.ch/projects/0001',
      shortcode: '0001',
      shortname: 'test',
      longname: 'Test Project',
      dataLicense: 'http://rdfh.ch/licenses/cc-by-4.0',
      dataCopyrightHolder: 'University of Basel',
      defaultDataAuthorship: ['Author A'],
      ...overrides,
    }) as ReadProject;

  const licenseCatalog = [
    {
      id: 'http://rdfh.ch/licenses/cc-by-4.0',
      labelEn: 'CC BY 4.0',
      uri: 'https://creativecommons.org/licenses/by/4.0/',
    },
  ];

  beforeEach(() => {
    projectApi = { get: jest.fn() };
    legalInfoApi = { getLicenses: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: ProjectApiService, useValue: projectApi },
        { provide: LegalInfoApiService, useValue: legalInfoApi },
      ],
    });

    service = TestBed.inject(ProjectDataRightsService);
  });

  describe('forProject', () => {
    it('fetches the project, resolves the license, and returns the rights payload', done => {
      projectApi.get.mockReturnValue(of({ project: makeProject() }));
      legalInfoApi.getLicenses.mockReturnValue(of(licenseCatalog));

      service.forProject('http://rdfh.ch/projects/0001').subscribe(rights => {
        expect(rights).toEqual({
          copyrightHolder: 'University of Basel',
          defaultDataAuthorship: ['Author A'],
          licenseLabel: 'CC BY 4.0',
          licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
          isPlaceholderCopyrightHolder: false,
          isPlaceholderLicense: false,
        });
        done();
      });
    });

    it('serves subsequent subscribers from cache without re-fetching', done => {
      projectApi.get.mockReturnValue(of({ project: makeProject() }));
      legalInfoApi.getLicenses.mockReturnValue(of(licenseCatalog));

      service.forProject('http://rdfh.ch/projects/0001').subscribe(() => {
        service.forProject('http://rdfh.ch/projects/0001').subscribe(() => {
          expect(projectApi.get).toHaveBeenCalledTimes(1);
          expect(legalInfoApi.getLicenses).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('returns undefined license fields when dataLicense is not set', done => {
      projectApi.get.mockReturnValue(of({ project: makeProject({ dataLicense: undefined }) }));

      service.forProject('http://rdfh.ch/projects/0001').subscribe(rights => {
        expect(rights.licenseLabel).toBeUndefined();
        expect(rights.licenseUrl).toBeUndefined();
        expect(legalInfoApi.getLicenses).not.toHaveBeenCalled();
        done();
      });
    });
  });

  // DEV-6994: dsp-tools writes `urn:dasch:placeholder` when the real legal info is unknown. The
  // sentinel IS a real entry in the license catalog (dsp-api's `allow-placeholder` defaults to true),
  // so a naive lookup matches it and surfaces a 96-char prose label behind a dead link.
  describe('placeholder sentinel', () => {
    const SENTINEL = 'urn:dasch:placeholder';

    it('flags a placeholder license and emits no label or url, without hitting the catalog', done => {
      projectApi.get.mockReturnValue(of({ project: makeProject({ dataLicense: SENTINEL }) }));

      service.forProject('http://rdfh.ch/projects/0001').subscribe(rights => {
        expect(rights.isPlaceholderLicense).toBe(true);
        expect(rights.licenseLabel).toBeUndefined();
        expect(rights.licenseUrl).toBeUndefined();
        // No point resolving a sentinel against the catalog — it would match and yield the prose label.
        expect(legalInfoApi.getLicenses).not.toHaveBeenCalled();
        done();
      });
    });

    it('flags a placeholder copyright holder', done => {
      projectApi.get.mockReturnValue(of({ project: makeProject({ dataCopyrightHolder: SENTINEL }) }));
      legalInfoApi.getLicenses.mockReturnValue(of(licenseCatalog));

      service.forProject('http://rdfh.ch/projects/0001').subscribe(rights => {
        expect(rights.isPlaceholderCopyrightHolder).toBe(true);
        done();
      });
    });

    it('leaves real legal info unflagged', done => {
      projectApi.get.mockReturnValue(of({ project: makeProject() }));
      legalInfoApi.getLicenses.mockReturnValue(of(licenseCatalog));

      service.forProject('http://rdfh.ch/projects/0001').subscribe(rights => {
        expect(rights.isPlaceholderLicense).toBe(false);
        expect(rights.isPlaceholderCopyrightHolder).toBe(false);
        expect(rights.licenseLabel).toBe('CC BY 4.0');
        expect(rights.licenseUrl).toBe('https://creativecommons.org/licenses/by/4.0/');
        done();
      });
    });

    it('never leaks the sentinel prose label or its dead uri, even though the catalog contains them', done => {
      // The short-circuit exists precisely because the sentinel IS a resolvable catalog entry: without
      // it, `licenses.find(...)` matches and both the prose label and the dead uri reach the UI.
      projectApi.get.mockReturnValue(of({ project: makeProject({ dataLicense: SENTINEL }) }));
      legalInfoApi.getLicenses.mockReturnValue(
        of([...licenseCatalog, { id: SENTINEL, uri: SENTINEL, labelEn: 'Placeholder License - Not a Real License…' }])
      );

      service.forProject('http://rdfh.ch/projects/0001').subscribe(rights => {
        expect(rights.isPlaceholderLicense).toBe(true);
        // Nothing sentinel-derived is exposed: consumers render the marker from the flag instead.
        expect(rights.licenseUrl).toBeUndefined();
        expect(rights.licenseLabel).toBeUndefined();
        done();
      });
    });
  });

  describe('error eviction', () => {
    it('does not cache a failed project fetch', done => {
      let calls = 0;
      projectApi.get.mockImplementation(() => {
        calls += 1;
        return calls === 1 ? throwError(() => new Error('boom')) : of({ project: makeProject() });
      });
      legalInfoApi.getLicenses.mockReturnValue(of(licenseCatalog));

      service.forProject('http://rdfh.ch/projects/0001').subscribe({
        error: () => {
          service.forProject('http://rdfh.ch/projects/0001').subscribe(rights => {
            expect(calls).toBe(2);
            expect(rights.licenseLabel).toBe('CC BY 4.0');
            done();
          });
        },
      });
    });

    it('does not cache a failed license fetch', done => {
      projectApi.get.mockReturnValue(of({ project: makeProject() }));
      let calls = 0;
      legalInfoApi.getLicenses.mockImplementation(() => {
        calls += 1;
        return calls === 1 ? throwError(() => new Error('boom')) : of(licenseCatalog);
      });

      service.forProject('http://rdfh.ch/projects/0001').subscribe({
        error: () => {
          service.forProject('http://rdfh.ch/projects/0001').subscribe(rights => {
            expect(calls).toBe(2);
            expect(rights.licenseLabel).toBe('CC BY 4.0');
            done();
          });
        },
      });
    });
  });

  describe('invalidateByShortcode', () => {
    it('evicts both the license cache and the matching project entry', done => {
      projectApi.get.mockReturnValue(of({ project: makeProject() }));
      legalInfoApi.getLicenses.mockReturnValue(of(licenseCatalog));

      service.forProject('http://rdfh.ch/projects/0001').subscribe(() => {
        service.invalidateByShortcode('0001');
        service.forProject('http://rdfh.ch/projects/0001').subscribe(() => {
          expect(projectApi.get).toHaveBeenCalledTimes(2);
          expect(legalInfoApi.getLicenses).toHaveBeenCalledTimes(2);
          done();
        });
      });
    });

    it('does not evict projects for unrelated shortcodes', done => {
      const projectA = makeProject({ id: 'http://rdfh.ch/projects/AAAA', shortcode: 'AAAA' });
      const projectB = makeProject({ id: 'http://rdfh.ch/projects/BBBB', shortcode: 'BBBB' });
      projectApi.get.mockImplementation((iri: string) =>
        iri === 'http://rdfh.ch/projects/AAAA' ? of({ project: projectA }) : of({ project: projectB })
      );
      legalInfoApi.getLicenses.mockReturnValue(of(licenseCatalog));

      service.forProject('http://rdfh.ch/projects/AAAA').subscribe(() => {
        service.forProject('http://rdfh.ch/projects/BBBB').subscribe(() => {
          service.invalidateByShortcode('AAAA');

          service.forProject('http://rdfh.ch/projects/BBBB').subscribe(() => {
            const bbbbCalls = projectApi.get.mock.calls.filter(
              ([iri]: [string]) => iri === 'http://rdfh.ch/projects/BBBB'
            );
            expect(bbbbCalls).toHaveLength(1);
            done();
          });
        });
      });
    });
  });

  describe('clearAll', () => {
    it('drops every cached entry', done => {
      projectApi.get.mockReturnValue(of({ project: makeProject() }));
      legalInfoApi.getLicenses.mockReturnValue(of(licenseCatalog));

      service.forProject('http://rdfh.ch/projects/0001').subscribe(() => {
        service.clearAll();
        service.forProject('http://rdfh.ch/projects/0001').subscribe(() => {
          expect(projectApi.get).toHaveBeenCalledTimes(2);
          expect(legalInfoApi.getLicenses).toHaveBeenCalledTimes(2);
          done();
        });
      });
    });
  });

  describe('fromProject', () => {
    it('resolves license from the licenses catalog without refetching the project', done => {
      legalInfoApi.getLicenses.mockReturnValue(of(licenseCatalog));

      service.fromProject(makeProject()).subscribe(rights => {
        expect(projectApi.get).not.toHaveBeenCalled();
        expect(rights.licenseLabel).toBe('CC BY 4.0');
        expect(rights.copyrightHolder).toBe('University of Basel');
        done();
      });
    });
  });
});
