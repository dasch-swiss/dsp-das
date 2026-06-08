import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DefaultClass, LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { CreateResourceClassDialogComponent } from '../forms/resource-class-form/create-resource-class-dialog.component';
import type { ResourceClassInfo } from '../ontology.types';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';
import { ClassListNode, OntologyClassNavigatorComponent } from './ontology-class-navigator.component';

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

const readList = (component: OntologyClassNavigatorComponent): ClassListNode[] =>
  (component as unknown as { _latestList$: BehaviorSubject<ClassListNode[]> })._latestList$.value;

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
  let dialog: { open: jest.Mock };

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

    dialog = { open: jest.fn() };

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
        { provide: MatDialog, useValue: dialog },
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

      const list = readList(component);
      expect(list.length).toBe(2);
      expect(list.every(n => n.matchedProperties.length === 0)).toBe(true);
    }));

    it('matches by class label', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]);
      component.filterControl.setValue('arch');
      flushFilter();

      const list = readList(component);
      expect(list.length).toBe(1);
      expect(list[0].iri).toBe('iri:A');
      // Class-label match — no matched-properties surfacing.
      expect(list[0].matchedProperties.length).toBe(0);
    }));

    it('surfaces the matched property labels when only a property matches', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([
        makeClass('iri:A', 'Archive', [
          { id: 'prop:x', label: 'hasArchive' },
          { id: 'prop:y', label: 'hasOther' },
        ]),
        makeClass('iri:B', 'Book'),
      ]);
      // 'hasarchive' does NOT match the class label 'Archive' (no 'has' substring there)
      // — so the class surfaces only via the property match.
      component.filterControl.setValue('hasarchive');
      flushFilter();

      const list = readList(component);
      expect(list.length).toBe(1);
      expect(list[0].iri).toBe('iri:A');
      expect(list[0].matchedProperties.map(p => p.iri)).toEqual(['prop:x']);
    }));

    it('does not surface properties when the class label itself matches', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([
        makeClass('iri:A', 'Archive', [
          { id: 'prop:x', label: 'hasArchive' },
          { id: 'prop:y', label: 'hasOther' },
        ]),
      ]);
      // 'archive' matches the class label, so we don't pollute the row with property surfacing.
      component.filterControl.setValue('archive');
      flushFilter();

      const list = readList(component);
      expect(list.length).toBe(1);
      expect(list[0].matchedProperties.length).toBe(0);
    }));

    it('emits an empty list when nothing matches', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]);
      component.filterControl.setValue('zzz-no-match');
      flushFilter();

      expect(readList(component).length).toBe(0);
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

    it('selectAllVisible selects every class IRI currently visible', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]);
      flushFilter();

      component.selectAllVisible();

      expect(viewService.selectClassIris).toHaveBeenCalledWith(['iri:A', 'iri:B']);
    }));

    it('deselectAllVisible deselects every class IRI currently visible', fakeAsync(() => {
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
    it('drops removed classes from the visible list on the next emission', fakeAsync(() => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]);
      flushFilter();
      expect(readList(component).length).toBe(2);

      currentOntologyClasses$.next([makeClass('iri:A', 'Archive')]);
      flushFilter();

      const list = readList(component);
      expect(list.length).toBe(1);
      expect(list[0].iri).toBe('iri:A');
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

  describe('create class', () => {
    it('opens the create-resource-class dialog with the chosen DefaultClass', () => {
      setup();
      const defaultClass = { iri: 'knora:StillImageRepresentation', label: 'Image', icon: 'image' } as DefaultClass;

      component.openCreateClass(defaultClass);

      expect(dialog.open).toHaveBeenCalledTimes(1);
      const [target, config] = dialog.open.mock.calls[0];
      expect(target).toBe(CreateResourceClassDialogComponent);
      expect((config as { data: DefaultClass }).data).toBe(defaultClass);
    });

    it('exposes DefaultResourceClasses.data as `defaultClasses`', () => {
      setup();
      expect(component.defaultClasses.length).toBeGreaterThan(0);
    });
  });

  describe('trackBy helpers', () => {
    it('trackNode returns the class IRI', () => {
      setup();
      expect(component.trackNode(0, { iri: 'iri:Z', label: 'l', matchedProperties: [] })).toBe('iri:Z');
    });

    it('trackProp returns the property IRI', () => {
      setup();
      expect(component.trackProp(0, { iri: 'prop:Z', label: 'l' })).toBe('prop:Z');
    });
  });
});
