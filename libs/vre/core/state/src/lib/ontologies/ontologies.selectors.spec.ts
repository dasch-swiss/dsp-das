import { Params } from '@angular/router';
import {
  ClassDefinition,
  OntologyMetadata,
  ReadOntology,
  ReadProject,
  ReadResource,
  StringLiteral,
} from '@dasch-swiss/dsp-js';
import { DspAppConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { IProjectOntologiesKeyValuePairs, OntologyProperties } from '../model-interfaces';
import { OntologiesSelectors } from './ontologies.selectors';
import { OntologiesStateModel } from './ontologies.state-model';

describe('OntologiesSelectors', () => {
  let mockState: OntologiesStateModel;
  let mockProject: ReadProject;
  let mockOntologies: ReadOntology[];
  let mockOntologyMetadata: OntologyMetadata[];
  let mockProjectOntologies: IProjectOntologiesKeyValuePairs;
  let mockOntologyProperties: OntologyProperties[];
  let mockResource: DspResource;
  let mockDspAppConfig: DspAppConfig;
  let mockParams: Params;

  beforeEach(() => {
    // Mock project
    mockProject = {
      id: 'http://rdfh.ch/projects/project1',
      shortcode: 'P001',
      shortname: 'project1',
      longname: 'Project One',
      description: [{ value: 'First project', language: 'en' }] as StringLiteral[],
      keywords: [],
      logo: '',
      status: true,
      selfjoin: false,
      ontologies: ['http://rdfh.ch/ontologies/project1'],
    };

    // Mock ontology metadata
    mockOntologyMetadata = [
      {
        id: 'http://rdfh.ch/ontologies/project1/v1',
        label: 'Project One Ontology',
        lastModificationDate: '2023-01-01T00:00:00.000Z',
        comment: 'Test ontology',
        attachedToProject: 'http://rdfh.ch/projects/project1',
        type: 'ontology',
      },
      {
        id: 'http://rdfh.ch/ontologies/project1/v2',
        label: 'Project One Ontology v2',
        lastModificationDate: '2023-02-01T00:00:00.000Z',
        comment: 'Test ontology v2',
        attachedToProject: 'http://rdfh.ch/projects/project1',
        type: 'ontology',
      },
    ];

    // Mock ontologies
    mockOntologies = [
      {
        id: 'http://rdfh.ch/ontologies/project1/v1',
        label: 'Project One Ontology',
        lastModificationDate: '2023-01-01T00:00:00.000Z',
        comment: 'Test ontology',
        classes: {
          'http://rdfh.ch/ontologies/project1#TestClass': {
            id: 'http://rdfh.ch/ontologies/project1#TestClass',
            label: 'Test Class',
            comment: 'A test class',
            subClassOf: [],
            propertiesList: [],
          } as ClassDefinition,
        },
        properties: {},
      } as unknown as ReadOntology,
      {
        id: 'http://rdfh.ch/ontologies/project1/v2',
        label: 'Project One Ontology v2',
        lastModificationDate: '2023-02-01T00:00:00.000Z',
        comment: 'Test ontology v2',
        classes: {
          'http://rdfh.ch/ontologies/project1#TestClass2': {
            id: 'http://rdfh.ch/ontologies/project1#TestClass2',
            label: 'Test Class 2',
            comment: 'A second test class',
            subClassOf: [],
            propertiesList: [],
          } as ClassDefinition,
        },
        properties: {},
      } as unknown as ReadOntology,
    ];

    // Mock project ontologies
    mockProjectOntologies = {
      'http://rdfh.ch/projects/project1': {
        ontologiesMetadata: mockOntologyMetadata,
        readOntologies: mockOntologies,
      },
    };

    // Mock ontology properties
    mockOntologyProperties = [
      {
        ontology: 'http://rdfh.ch/ontologies/project1/v1',
        properties: [],
      },
      {
        ontology: 'http://rdfh.ch/ontologies/project1/v2',
        properties: [],
      },
    ];

    // Mock resource
    mockResource = new DspResource({
      attachedToProject: 'http://rdfh.ch/projects/project1',
    } as ReadResource);

    // Mock config
    mockDspAppConfig = {
      iriBase: 'http://rdfh.ch',
      geonameToken: 'token',
    };

    // Mock params
    mockParams = {
      [RouteConstants.ontoParameter]: 'project1',
      [RouteConstants.classParameter]: 'TestClass',
    };

    // Initialize state
    mockState = {
      isLoading: false,
      projectOntologies: mockProjectOntologies,
      currentOntology: mockOntologies[0],
      currentProjectOntologyProperties: mockOntologyProperties,
    };

    // Mock service methods using spies
    jest.spyOn(OntologyService, 'getOntologyName').mockImplementation((id: string) => {
      if (id.includes('project1')) return 'project1';
      return 'unknown';
    });

    jest.spyOn(ProjectService, 'getProjectIri').mockImplementation(() => 'http://rdfh.ch/projects/project1');
  });

  describe('isLoading', () => {
    it('should return loading state', () => {
      const result = OntologiesSelectors.isLoading(mockState);

      expect(result).toBe(false);
    });

    it('should return true when loading', () => {
      mockState.isLoading = true;
      const result = OntologiesSelectors.isLoading(mockState);

      expect(result).toBe(true);
    });

    it('should return undefined when loading state is undefined', () => {
      mockState.isLoading = undefined;
      const result = OntologiesSelectors.isLoading(mockState);

      expect(result).toBeUndefined();
    });
  });

  describe('currentProjectOntologyMetadata', () => {
    it('should return ontology metadata for current project', () => {
      const result = OntologiesSelectors.currentProjectOntologyMetadata(mockState, mockProject);

      expect(result).toEqual(mockOntologyMetadata);
    });

    it('should return empty array when project is undefined', () => {
      const result = OntologiesSelectors.currentProjectOntologyMetadata(mockState, undefined);

      expect(result).toEqual([]);
    });

    it('should return empty array when project ontologies not found', () => {
      const differentProject = {
        ...mockProject,
        id: 'http://rdfh.ch/projects/project2',
      };

      const result = OntologiesSelectors.currentProjectOntologyMetadata(mockState, differentProject);

      expect(result).toEqual([]);
    });
  });

  describe('currentProjectOntologies', () => {
    it('should return ontologies for current project', () => {
      const result = OntologiesSelectors.currentProjectOntologies(mockState, mockProject);

      expect(result).toEqual(mockOntologies);
    });

    it('should return empty array when project is undefined', () => {
      const result = OntologiesSelectors.currentProjectOntologies(mockState, undefined);

      expect(result).toEqual([]);
    });

    it('should return empty array when project ontologies not found', () => {
      const differentProject = {
        ...mockProject,
        id: 'http://rdfh.ch/projects/project2',
      };

      const result = OntologiesSelectors.currentProjectOntologies(mockState, differentProject);

      expect(result).toEqual([]);
    });
  });
});
