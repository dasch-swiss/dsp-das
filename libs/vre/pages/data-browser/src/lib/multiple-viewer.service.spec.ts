import { TestBed } from '@angular/core/testing';

import { MultipleViewerService } from './multiple-viewer.service';

describe('MultipleViewerService - Additional Tests', () => {
  let service: MultipleViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultipleViewerService);
  });

  describe('Initial state', () => {
    it('should start with empty selection and selectMode false', () => {
      expect(service.selectMode).toBe(false);
      
      let selectedResources: string[] = [];
      service.selectedResourceIds$.subscribe(resources => {
        selectedResources = resources;
      });
      
      expect(selectedResources).toEqual([]);
    });
  });

  describe('Observable behavior', () => {
    it('should emit new values when resources are added', () => {
      const emittedValues: string[][] = [];
      
      service.selectedResourceIds$.subscribe(resources => {
        emittedValues.push([...resources]);
      });
      
      service.addResource('resource-1');
      service.addResource('resource-2');
      
      expect(emittedValues).toEqual([
        [], // initial empty state
        ['resource-1'],
        ['resource-1', 'resource-2']
      ]);
    });

    it('should emit when resources are removed', () => {
      const emittedValues: string[][] = [];
      
      service.addResource('resource-1');
      service.addResource('resource-2');
      
      service.selectedResourceIds$.subscribe(resources => {
        emittedValues.push([...resources]);
      });
      
      service.removeResource('resource-1');
      
      expect(emittedValues).toEqual([
        ['resource-1', 'resource-2'], // current state when subscribed
        ['resource-1'] // after calling selectOneResource due to single resource remaining
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should handle removing non-existent resource gracefully', () => {
      service.addResource('resource-1');
      service.addResource('resource-2');
      
      let selectedResources: string[] = [];
      service.selectedResourceIds$.subscribe(resources => {
        selectedResources = resources;
      });
      
      service.removeResource('non-existent');
      
      expect(selectedResources).toEqual(['resource-1', 'resource-2']);
      expect(service.selectMode).toBe(true);
    });

    it('should handle removing from empty selection', () => {
      let selectedResources: string[] = [];
      service.selectedResourceIds$.subscribe(resources => {
        selectedResources = resources;
      });
      
      service.removeResource('resource-1');
      
      expect(selectedResources).toEqual([]);
      expect(service.selectMode).toBe(false);
    });

    it('should maintain selectMode when switching between single selections', () => {
      service.selectOneResource('resource-1');
      expect(service.selectMode).toBe(false);
      
      service.selectOneResource('resource-2');
      expect(service.selectMode).toBe(false);
      
      let selectedResources: string[] = [];
      service.selectedResourceIds$.subscribe(resources => {
        selectedResources = resources;
      });
      
      expect(selectedResources).toEqual(['resource-2']);
    });
  });

  describe('State transitions', () => {
    it('should transition from selectMode false to true when adding to single selection', () => {
      // Start with single selection (selectMode false)
      service.selectOneResource('resource-1');
      expect(service.selectMode).toBe(false);
      
      // Add another resource (should clear first and enter selectMode)
      service.addResource('resource-2');
      expect(service.selectMode).toBe(true);
      
      let selectedResources: string[] = [];
      service.selectedResourceIds$.subscribe(resources => {
        selectedResources = resources;
      });
      
      expect(selectedResources).toEqual(['resource-2']);
    });

    it('should maintain state when adding resources in selectMode', () => {
      service.addResource('resource-1');
      service.addResource('resource-2');
      expect(service.selectMode).toBe(true);
      
      service.addResource('resource-3');
      expect(service.selectMode).toBe(true);
      
      let selectedResources: string[] = [];
      service.selectedResourceIds$.subscribe(resources => {
        selectedResources = resources;
      });
      
      expect(selectedResources).toEqual(['resource-1', 'resource-2', 'resource-3']);
    });
  });

  describe('Array mutation behavior', () => {
    it('should maintain reference integrity when adding resources', () => {
      let resourceArrays: string[][] = [];
      
      service.selectedResourceIds$.subscribe(resources => {
        resourceArrays.push(resources);
      });
      
      service.addResource('resource-1');
      service.addResource('resource-2');
      
      // Should have 3 emissions: initial [], then ['resource-1'], then ['resource-1', 'resource-2']
      expect(resourceArrays.length).toBe(3);
      expect(resourceArrays[0]).toEqual([]);
      expect(resourceArrays[1]).toEqual(['resource-1']);
      expect(resourceArrays[2]).toEqual(['resource-1', 'resource-2']);
    });

    it('should properly splice when removing resources', () => {
      service.addResource('resource-1');
      service.addResource('resource-2');
      service.addResource('resource-3');
      
      let selectedResources: string[] = [];
      service.selectedResourceIds$.subscribe(resources => {
        selectedResources = resources;
      });
      
      service.removeResource('resource-2');
      
      expect(selectedResources).toEqual(['resource-1', 'resource-3']);
    });
  });
});