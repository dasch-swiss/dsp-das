import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import type { ResourceClassInfo } from '../ontology.types';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';
import { OntologyClassNavigatorComponent } from './ontology-class-navigator.component';

/**
 * Builds a minimal `ResourceClassInfo`-shaped stub. The component reads
 * `.id`, `.label`, `.labels`, and `.properties[*].propDef.{id,label,labels}`.
 */
const makeClass = (id: string, label: string, properties: { id: string; label: string }[] = []): ResourceClassInfo =>
  ({
    id,
    label,
    labels: [],
    properties: properties.map(p => ({
      propDef: { id: p.id, label: p.label, labels: [] },
    })),
  }) as unknown as ResourceClassInfo;

describe('OntologyClassNavigatorComponent', () => {
  let fixture: ComponentFixture<OntologyClassNavigatorComponent>;
  let component: OntologyClassNavigatorComponent;
  let currentOntologyClasses$: BehaviorSubject<ResourceClassInfo[]>;
  let selectedClassIris$: BehaviorSubject<Set<string>>;
  let isEditingEnabled$: BehaviorSubject<boolean>;
  let viewService: {
    selectedClassIris$: BehaviorSubject<Set<string>>;
    isEditingEnabled$: BehaviorSubject<boolean>;
    toggleClassSelection: jest.Mock;
    selectClassIris: jest.Mock;
    deselectClassIris: jest.Mock;
    setClassFilter: jest.Mock;
  };

  const setup = () => {
    currentOntologyClasses$ = new BehaviorSubject<ResourceClassInfo[]>([]);
    selectedClassIris$ = new BehaviorSubject<Set<string>>(new Set());
    isEditingEnabled$ = new BehaviorSubject<boolean>(true);

    viewService = {
      selectedClassIris$,
      isEditingEnabled$,
      toggleClassSelection: jest.fn((iri: string) => {
        const next = new Set(selectedClassIris$.value);
        if (next.has(iri)) {
          next.delete(iri);
        } else {
          next.add(iri);
        }
        selectedClassIris$.next(next);
      }),
      selectClassIris: jest.fn((iris: string[]) => {
        const next = new Set(selectedClassIris$.value);
        iris.forEach(i => next.add(i));
        selectedClassIris$.next(next);
      }),
      deselectClassIris: jest.fn((iris: string[]) => {
        const next = new Set(selectedClassIris$.value);
        iris.forEach(i => next.delete(i));
        selectedClassIris$.next(next);
      }),
      setClassFilter: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [OntologyClassNavigatorComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: OntologyEditorViewService, useValue: viewService },
        { provide: OntologyEditService, useValue: { currentOntologyClasses$ } },
        {
          provide: LocalizationService,
          useValue: {
            currentLanguage$: new BehaviorSubject('en'),
            getCurrentLanguage: () => 'en',
          },
        },
      ],
    });

    fixture = TestBed.createComponent(OntologyClassNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  /** Advance past the 150 ms debounce on the filter pipeline. */
  const flushFilter = () => {
    tick(200);
    fixture.detectChanges();
  };

  describe('filtering', () => {
    it('shows all classes when the filter is empty', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]);
      flushFilter();

      const tree = (component as unknown as { _latestTree$: BehaviorSubject<unknown[]> })._latestTree$.value;
      expect(tree.length).toBe(2);
    }));

    it('matches by class label', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]);
      component.filterControl.setValue('arch');
      flushFilter();

      const tree = (component as unknown as { _latestTree$: BehaviorSubject<{ iri: string }[]> })._latestTree$.value;
      expect(tree.length).toBe(1);
      expect(tree[0].iri).toBe('iri:A');
    }));

    it('matches by property label (and limits visible properties to the match)', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([
        makeClass('iri:A', 'Archive', [
          { id: 'prop:x', label: 'hasArchive' },
          { id: 'prop:y', label: 'hasOther' },
        ]),
        makeClass('iri:B', 'Book'),
      ]);
      component.filterControl.setValue('archive');
      flushFilter();

      const tree = (
        component as unknown as { _latestTree$: BehaviorSubject<{ iri: string; properties: { iri: string }[] }[]> }
      )._latestTree$.value;
      // Class A's label also matches 'archive', so it keeps the full property list.
      expect(tree.find(c => c.iri === 'iri:A')?.properties.length).toBe(2);

      // Filter that ONLY matches a property: full class-label miss, property hit.
      component.filterControl.setValue('hasarchive');
      flushFilter();

      const tree2 = (
        component as unknown as { _latestTree$: BehaviorSubject<{ iri: string; properties: { iri: string }[] }[]> }
      )._latestTree$.value;
      expect(tree2.length).toBe(1);
      expect(tree2[0].iri).toBe('iri:A');
      expect(tree2[0].properties.map(p => p.iri)).toEqual(['prop:x']);
    }));

    it('emits an empty tree when nothing matches', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]);
      component.filterControl.setValue('zzz-no-match');
      flushFilter();

      const tree = (component as unknown as { _latestTree$: BehaviorSubject<unknown[]> })._latestTree$.value;
      expect(tree.length).toBe(0);
    }));

    it('clearFilter resets the filter control', () => {
      setup();
      component.filterControl.setValue('foo');
      component.clearFilter();
      expect(component.filterControl.value).toBe('');
    });
  });

  describe('selection', () => {
    it('toggleClass delegates to the view service', () => {
      setup();
      component.toggleClass('iri:A');
      expect(viewService.toggleClassSelection).toHaveBeenCalledWith('iri:A');
    });

    it('selectAllVisible selects every class IRI currently in the filtered tree', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]);
      flushFilter();

      component.selectAllVisible();

      expect(viewService.selectClassIris).toHaveBeenCalledWith(['iri:A', 'iri:B']);
    }));

    it('deselectAllVisible deselects every class IRI in the filtered tree', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]);
      flushFilter();
      selectedClassIris$.next(new Set(['iri:A', 'iri:B']));

      component.deselectAllVisible();

      expect(viewService.deselectClassIris).toHaveBeenCalledWith(['iri:A', 'iri:B']);
    }));

    it('selectAllVisible respects the filter (only selects visible IRIs)', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]);
      component.filterControl.setValue('arch');
      flushFilter();

      component.selectAllVisible();

      expect(viewService.selectClassIris).toHaveBeenCalledWith(['iri:A']);
    }));

    it('isSelected returns true only when the IRI is in the set', () => {
      setup();
      expect(component.isSelected('iri:A', new Set(['iri:A']))).toBe(true);
      expect(component.isSelected('iri:A', new Set(['iri:B']))).toBe(false);
    });
  });

  describe('reconciliation', () => {
    it('drops removed classes from the visible tree on the next emission', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]);
      flushFilter();

      let tree = (component as unknown as { _latestTree$: BehaviorSubject<{ iri: string }[]> })._latestTree$.value;
      expect(tree.length).toBe(2);

      currentOntologyClasses$.next([makeClass('iri:A', 'Archive')]);
      flushFilter();

      tree = (component as unknown as { _latestTree$: BehaviorSubject<{ iri: string }[]> })._latestTree$.value;
      expect(tree.length).toBe(1);
      expect(tree[0].iri).toBe('iri:A');
    }));
  });

  describe('view service mirroring', () => {
    it('writes the current filter text to setClassFilter on each emission', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive')]);
      flushFilter();
      viewService.setClassFilter.mockClear();

      component.filterControl.setValue('arch');
      flushFilter();

      expect(viewService.setClassFilter).toHaveBeenCalledWith('arch');
    }));
  });

  describe('tree helpers', () => {
    it('isClassNode discriminates class nodes from property nodes', () => {
      setup();
      expect(component.isClassNode(0, { iri: 'i', label: 'l', properties: [] })).toBe(true);
      expect(component.isClassNode(0, { iri: 'i', label: 'l' })).toBe(false);
    });

    it('childrenAccessor returns properties for classes and [] for properties', () => {
      setup();
      const klass = { iri: 'i', label: 'l', properties: [{ iri: 'p', label: 'pl' }] };
      const prop = { iri: 'p', label: 'pl' };
      expect(component.childrenAccessor(klass)).toEqual([{ iri: 'p', label: 'pl' }]);
      expect(component.childrenAccessor(prop)).toEqual([]);
    });
  });
});
