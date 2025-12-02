import { TestBed } from '@angular/core/testing';
import { SearchStateService } from './search-state.service';
import { StatementElement, IriLabelPair } from '../model';

describe('SearchStateService', () => {
  let service: SearchStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchStateService],
    });
    service = TestBed.inject(SearchStateService);
  });

  describe('State Management', () => {
    it('should initialize with a valid stateId', () => {
      const currentState = service.currentState;
      expect(currentState.stateId).toBeDefined();
      expect(currentState.stateId.length).toBeGreaterThan(0);
    });

    it('should create a new stateId when patchState is called', () => {
      const initialStateId = service.currentState.stateId;

      service.patchState({ selectedResourceClass: { iri: 'test', label: 'Test' } });

      const newStateId = service.currentState.stateId;
      expect(newStateId).not.toBe(initialStateId);
    });
  });

  describe('Observable Emissions', () => {
    it('should emit selectedResourceClass$ when state changes', done => {
      const testResourceClass: IriLabelPair = { iri: 'http://test.org/class', label: 'Test Class' };
      let emissionCount = 0;

      service.selectedResourceClass$.subscribe(resourceClass => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(resourceClass).toBeUndefined(); // Initial state
        } else if (emissionCount === 2) {
          expect(resourceClass).toEqual(testResourceClass);
          done();
        }
      });

      service.patchState({ selectedResourceClass: testResourceClass });
    });

    it('should emit statementElements$ when state changes', done => {
      const newStatement = new StatementElement();
      let emissionCount = 0;

      service.statementElements$.subscribe(elements => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(elements.length).toBe(1); // Initial state with startWith
        } else if (emissionCount === 2) {
          expect(elements.length).toBe(1); // After patch, still has 1 from current state
          done();
        }
      });

      // Patch with a different number of elements to trigger emission
      service.patchState({ statementElements: [newStatement] });
    });

    it('should not emit when stateId is unchanged', done => {
      let emissionCount = 0;

      service.selectedResourceClass$.subscribe(() => {
        emissionCount++;
      });

      // Wait a bit to ensure no extra emissions
      setTimeout(() => {
        expect(emissionCount).toBe(1); // Only initial emission
        done();
      }, 100);
    });
  });

  describe('Undo/Redo Functionality', () => {
    it('should restore previous state on undo and emit to observables', done => {
      const resourceClass1: IriLabelPair = { iri: 'http://test.org/class1', label: 'Class 1' };
      const resourceClass2: IriLabelPair = { iri: 'http://test.org/class2', label: 'Class 2' };
      let emissionCount = 0;

      service.selectedResourceClass$.subscribe(resourceClass => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(resourceClass).toBeUndefined(); // Initial
        } else if (emissionCount === 2) {
          expect(resourceClass).toEqual(resourceClass1);
        } else if (emissionCount === 3) {
          expect(resourceClass).toEqual(resourceClass2);
        } else if (emissionCount === 4) {
          expect(resourceClass).toEqual(resourceClass1); // After undo
          done();
        }
      });

      service.patchState({ selectedResourceClass: resourceClass1 });
      service.patchState({ selectedResourceClass: resourceClass2 });
      service.undoLastChange();
    });

    it('should restore next state on redo and emit to observables', done => {
      const resourceClass1: IriLabelPair = { iri: 'http://test.org/class1', label: 'Class 1' };
      const resourceClass2: IriLabelPair = { iri: 'http://test.org/class2', label: 'Class 2' };
      let emissionCount = 0;

      service.selectedResourceClass$.subscribe(resourceClass => {
        emissionCount++;
        if (emissionCount === 5) {
          expect(resourceClass).toEqual(resourceClass2); // After redo
          done();
        }
      });

      service.patchState({ selectedResourceClass: resourceClass1 });
      service.patchState({ selectedResourceClass: resourceClass2 });
      service.undoLastChange();
      service.redoLastChange();
    });

    it('should clear redo stack when new change is made after undo', () => {
      const resourceClass1: IriLabelPair = { iri: 'http://test.org/class1', label: 'Class 1' };
      const resourceClass2: IriLabelPair = { iri: 'http://test.org/class2', label: 'Class 2' };
      const resourceClass3: IriLabelPair = { iri: 'http://test.org/class3', label: 'Class 3' };

      service.patchState({ selectedResourceClass: resourceClass1 });
      service.patchState({ selectedResourceClass: resourceClass2 });
      service.undoLastChange();

      expect(service.canRedo).toBe(true);

      service.patchState({ selectedResourceClass: resourceClass3 });

      expect(service.canRedo).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should not undo when undo stack is empty', () => {
      const initialState = service.currentState;

      service.undoLastChange();

      expect(service.currentState).toBe(initialState);
      expect(service.canUndo).toBe(false);
    });

    it('should not redo when redo stack is empty', () => {
      service.patchState({ selectedResourceClass: { iri: 'test', label: 'Test' } });
      const currentState = service.currentState;

      service.redoLastChange();

      expect(service.currentState).toBe(currentState);
      expect(service.canRedo).toBe(false);
    });
  });
});
