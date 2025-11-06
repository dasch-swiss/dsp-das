/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { TestBed } from '@angular/core/testing';
import { KnoraApiConnection, ReadOntology, StoredProject } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { of } from 'rxjs';
import { ProjectPageService } from './project-page.service';

describe('ProjectPageService', () => {
  let service: ProjectPageService;
  let projectApiService: jasmine.SpyObj<ProjectApiService>;
  let userService: jasmine.SpyObj<UserService>;
  let dspApiConnection: jasmine.SpyObj<KnoraApiConnection>;
  let projectService: jasmine.SpyObj<ProjectService>;

  const mockProject: StoredProject = {
    id: 'http://rdfh.ch/projects/0001',
    shortname: 'test-project',
    shortcode: '0001',
    longname: 'Test Project',
    description: [{ language: 'en', value: 'A test project' }],
    keywords: [],
    logo: '',
    status: true,
    selfjoin: false,
  } as StoredProject;

  const mockUser = {
    name: 'testuser',
    jwt: 'test-token',
    lang: 'en',
    sysAdmin: false,
    projectAdmin: ['http://rdfh.ch/projects/0001'],
  };

  const mockOntology: ReadOntology = {
    id: 'http://0.0.0.0:3333/ontology/0001/onto/v2',
    label: 'Test Ontology',
  } as ReadOntology;

  beforeEach(() => {
    const projectApiServiceSpy = jasmine.createSpyObj('ProjectApiService', ['get']);
    const userServiceSpy = jasmine.createSpyObj('UserService', [], {
      user$: of(mockUser),
    });
    const dspApiConnectionSpy = jasmine.createSpyObj('KnoraApiConnection', [], {
      v2: {
        onto: jasmine.createSpyObj('OntologyEndpoint', ['getOntologiesByProjectIri', 'getOntology']),
      },
    });
    const projectServiceSpy = jasmine.createSpyObj('ProjectService', ['uuidToIri']);

    // Setup default return values
    projectApiServiceSpy.get.and.returnValue(of({ project: mockProject }));
    projectServiceSpy.uuidToIri.and.returnValue('http://rdfh.ch/projects/0001');
    dspApiConnectionSpy.v2.onto.getOntologiesByProjectIri.and.returnValue(
      of({ ontologies: [{ id: mockOntology.id, label: mockOntology.label }] })
    );
    dspApiConnectionSpy.v2.onto.getOntology.and.returnValue(of(mockOntology));

    TestBed.configureTestingModule({
      providers: [
        ProjectPageService,
        { provide: ProjectApiService, useValue: projectApiServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: DspApiConnectionToken, useValue: dspApiConnectionSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
      ],
    });

    service = TestBed.inject(ProjectPageService);
    projectApiService = TestBed.inject(ProjectApiService) as jasmine.SpyObj<ProjectApiService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    dspApiConnection = TestBed.inject(DspApiConnectionToken) as jasmine.SpyObj<KnoraApiConnection>;
    projectService = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setup', () => {
    it('should initialize currentProjectUuid and currentProjectId', () => {
      const testUuid = 'test-uuid-1234';
      const expectedIri = 'http://rdfh.ch/projects/0001';

      service.setup(testUuid);

      expect(projectService.uuidToIri).toHaveBeenCalledWith(testUuid);
      expect(service.currentProjectUuid).toBe(testUuid);
      expect(service.currentProjectId).toBe(expectedIri);
    });

    it('should trigger currentProject$ observable to emit', done => {
      const testUuid = 'test-uuid-1234';

      service.setup(testUuid);

      service.currentProject$.subscribe(project => {
        expect(project).toEqual(mockProject);
        expect(projectApiService.get).toHaveBeenCalledWith('http://rdfh.ch/projects/0001');
        done();
      });
    });
  });

  describe('currentProjectUuid getter', () => {
    it('should return the current project UUID after setup', () => {
      const testUuid = 'test-uuid-1234';
      service.setup(testUuid);

      expect(service.currentProjectUuid).toBe(testUuid);
    });

    it('should throw error when accessed before setup', () => {
      expect(() => service.currentProjectUuid).toThrowError(
        'ProjectPageService: setup() must be called before accessing currentProjectUuid'
      );
    });
  });

  describe('currentProjectId getter', () => {
    it('should return the current project IRI after setup', () => {
      const testUuid = 'test-uuid-1234';
      const expectedIri = 'http://rdfh.ch/projects/0001';

      service.setup(testUuid);

      expect(service.currentProjectId).toBe(expectedIri);
    });

    it('should throw error when accessed before setup', () => {
      expect(() => service.currentProjectId).toThrowError(
        'ProjectPageService: setup() must be called before accessing currentProjectId'
      );
    });
  });

  describe('currentProject$', () => {
    it('should emit the current project after setup', done => {
      service.setup('test-uuid');

      service.currentProject$.subscribe(project => {
        expect(project).toEqual(mockProject);
        done();
      });
    });

    it('should fetch project from API using the correct project ID', done => {
      const testProjectId = 'http://rdfh.ch/projects/0001';

      service.setup('test-uuid');

      service.currentProject$.subscribe(() => {
        expect(projectApiService.get).toHaveBeenCalledWith(testProjectId);
        done();
      });
    });

    it('should share the same project emission across multiple subscribers', done => {
      service.setup('test-uuid');

      let emissionCount = 0;

      service.currentProject$.subscribe(() => {
        emissionCount++;
      });

      service.currentProject$.subscribe(() => {
        emissionCount++;
        // Should only call API once due to shareReplay
        expect(projectApiService.get).toHaveBeenCalledTimes(1);
        expect(emissionCount).toBe(2);
        done();
      });
    });
  });

  describe('reloadProject', () => {
    it('should trigger a new fetch of the current project', done => {
      service.setup('test-uuid');

      // Subscribe once to trigger initial load
      service.currentProject$.subscribe(() => {
        expect(projectApiService.get).toHaveBeenCalledTimes(1);

        // Reset spy
        projectApiService.get.calls.reset();

        // Reload project
        service.reloadProject();

        // Subscribe again to trigger reload
        service.currentProject$.subscribe(() => {
          expect(projectApiService.get).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });
  });

  describe('hasProjectAdminRights$', () => {
    it('should emit true when user is project admin', done => {
      service.setup('test-uuid');

      service.hasProjectAdminRights$.subscribe(hasRights => {
        expect(hasRights).toBe(true);
        done();
      });
    });

    it('should emit false when user is not project admin', done => {
      const nonAdminUser = {
        ...mockUser,
        projectAdmin: [], // Not admin of any project
      };

      Object.defineProperty(userService, 'user$', {
        get: () => of(nonAdminUser),
      });

      service.setup('test-uuid');

      service.hasProjectAdminRights$.subscribe(hasRights => {
        expect(hasRights).toBe(false);
        done();
      });
    });
  });

  describe('hasProjectMemberRights$', () => {
    it('should check if user has member rights for current project', done => {
      service.setup('test-uuid');

      service.hasProjectMemberRights$.subscribe(hasRights => {
        // This will depend on UserPermissions.hasProjectMemberRights implementation
        expect(hasRights).toBeDefined();
        done();
      });
    });
  });

  describe('ontologiesMetadata$', () => {
    it('should fetch ontologies metadata for current project', done => {
      service.setup('test-uuid');

      service.ontologiesMetadata$.subscribe(ontologies => {
        expect(dspApiConnection.v2.onto.getOntologiesByProjectIri).toHaveBeenCalledWith(mockProject.id);
        expect(ontologies).toBeDefined();
        done();
      });
    });
  });

  describe('ontologies$', () => {
    it('should fetch full ontology data', done => {
      service.setup('test-uuid');

      service.ontologies$.subscribe(ontologies => {
        expect(dspApiConnection.v2.onto.getOntology).toHaveBeenCalled();
        expect(ontologies).toBeDefined();
        done();
      });
    });

    it('should return empty array when project has no ontologies', done => {
      dspApiConnection.v2.onto.getOntologiesByProjectIri.and.returnValue(of({ ontologies: [] }));

      service.setup('test-uuid');

      service.ontologies$.subscribe(ontologies => {
        expect(ontologies).toEqual([]);
        expect(dspApiConnection.v2.onto.getOntology).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
