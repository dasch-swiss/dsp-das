import { ReadResource } from '@dasch-swiss/dsp-js';
import { MultipleViewerService } from './multiple-viewer.service';

describe('MultipleViewerService', () => {
  let service: MultipleViewerService;

  const createMockResource = (id: string): ReadResource =>
    ({
      id,
      type: 'http://api.knora.org/ontology/knora-api/v2#Resource',
      label: `Resource ${id}`,
    }) as ReadResource;

  const mockResource1 = createMockResource('resource-1');
  const mockResource2 = createMockResource('resource-2');
  const mockResource3 = createMockResource('resource-3');

  beforeEach(() => {
    service = new MultipleViewerService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('selectOneResource', () => {
    it('should select a single resource and set selectMode to false', done => {
      service.selectOneResource(mockResource1);

      service.selectedResources$.subscribe(resources => {
        expect(resources).toEqual([mockResource1]);
        expect(service.selectMode).toBe(false);
        done();
      });
    });

    it('should replace previously selected resource', done => {
      service.selectOneResource(mockResource1);
      service.selectOneResource(mockResource2);

      service.selectedResources$.subscribe(resources => {
        expect(resources).toEqual([mockResource2]);
        done();
      });
    });
  });

  describe('addResources', () => {
    it('should add multiple resources and set selectMode to true', done => {
      service.addResources([mockResource1, mockResource2]);

      service.selectedResources$.subscribe(resources => {
        expect(resources.length).toBe(2);
        expect(resources).toContain(mockResource1);
        expect(resources).toContain(mockResource2);
        expect(service.selectMode).toBe(true);
        done();
      });
    });

    it('should not add duplicate resources', done => {
      service.addResources([mockResource1, mockResource2]);
      service.addResources([mockResource2, mockResource3]);

      service.selectedResources$.subscribe(resources => {
        expect(resources.length).toBe(3);
        expect(resources.filter(r => r === mockResource2).length).toBe(1);
        done();
      });
    });

    it('should clear single selection when switching to multi-mode', done => {
      service.selectOneResource(mockResource1);
      service.addResources([mockResource2, mockResource3]);

      service.selectedResources$.subscribe(resources => {
        expect(resources).not.toContain(mockResource1);
        expect(resources).toContain(mockResource2);
        expect(resources).toContain(mockResource3);
        done();
      });
    });
  });

  describe('removeResources', () => {
    it('should remove specified resources', done => {
      service.addResources([mockResource1, mockResource2, mockResource3]);
      service.removeResources([mockResource2]);

      service.selectedResources$.subscribe(resources => {
        expect(resources.length).toBe(2);
        expect(resources).not.toContain(mockResource2);
        done();
      });
    });

    it('should set selectMode to false when all resources removed', () => {
      service.addResources([mockResource1, mockResource2]);
      service.removeResources([mockResource1, mockResource2]);

      expect(service.selectMode).toBe(false);
    });

    it('should not throw error when removing non-existent resource', done => {
      service.addResources([mockResource1]);
      service.removeResources([mockResource2]);

      service.selectedResources$.subscribe(resources => {
        expect(resources).toEqual([mockResource1]);
        done();
      });
    });
  });

  describe('reset', () => {
    it('should clear single selected resource and set selectMode to false', done => {
      service.selectOneResource(mockResource1);
      service.reset();

      service.selectedResources$.subscribe(resources => {
        expect(resources).toEqual([]);
        expect(service.selectMode).toBe(false);
        done();
      });
    });

    it('should clear multiple selected resources', done => {
      service.addResources([mockResource1, mockResource2, mockResource3]);
      service.reset();

      service.selectedResources$.subscribe(resources => {
        expect(resources).toEqual([]);
        expect(service.selectMode).toBe(false);
        done();
      });
    });
  });
});
