import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { BehaviorSubject } from 'rxjs';
import type { PropertyInfo } from '../ontology.types';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';
import { OntologyPropertyLibraryComponent } from './ontology-property-library.component';
import { PropertyRowComponent } from './property-row.component';

const makeProperty = (
  id: string,
  label: string,
  options: {
    usedByClasses?: { id: string }[];
    group?: string;
  } = {}
): PropertyInfo =>
  ({
    propDef: { id, label, labels: [] },
    propType: { icon: 'short_text', group: options.group ?? 'Text' },
    usedByClasses: options.usedByClasses ?? [],
  }) as unknown as PropertyInfo;

describe('OntologyPropertyLibraryComponent', () => {
  let fixture: ComponentFixture<OntologyPropertyLibraryComponent>;
  let component: OntologyPropertyLibraryComponent;
  let currentProjectsProperties$: BehaviorSubject<PropertyInfo[]>;
  let isEditingEnabled$: BehaviorSubject<boolean>;
  let viewService: {
    isEditingEnabled$: BehaviorSubject<boolean>;
    setPropertyDragging: jest.Mock;
    setUnusedPropertiesOnly: jest.Mock;
    setPropertyFilter: jest.Mock;
    setPropertyCategoryFilters: jest.Mock;
  };

  const setup = () => {
    currentProjectsProperties$ = new BehaviorSubject<PropertyInfo[]>([]);
    isEditingEnabled$ = new BehaviorSubject<boolean>(true);

    viewService = {
      isEditingEnabled$,
      setPropertyDragging: jest.fn(),
      setUnusedPropertiesOnly: jest.fn(),
      setPropertyFilter: jest.fn(),
      setPropertyCategoryFilters: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [OntologyPropertyLibraryComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: OntologyEditorViewService, useValue: viewService },
        {
          provide: OntologyEditService,
          useValue: { currentProjectsProperties$ },
        },
        {
          provide: LocalizationService,
          useValue: {
            currentLanguage$: new BehaviorSubject('en'),
            getCurrentLanguage: () => 'en',
          },
        },
      ],
    }).overrideComponent(OntologyPropertyLibraryComponent, {
      remove: { imports: [PropertyRowComponent] },
      add: { imports: [MockComponent(PropertyRowComponent)] },
    });

    fixture = TestBed.createComponent(OntologyPropertyLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const flushFilter = () => {
    tick(200);
    fixture.detectChanges();
  };

  describe('filtering', () => {
    it('shows all properties when no filters are active', fakeAsync(() => {
      setup();
      currentProjectsProperties$.next([makeProperty('p:1', 'hasFoo'), makeProperty('p:2', 'hasBar')]);
      flushFilter();
      const rows = fixture.nativeElement.querySelectorAll('app-property-row');
      expect(rows.length).toBe(2);
    }));

    it('filters by case-insensitive label substring', fakeAsync(() => {
      setup();
      currentProjectsProperties$.next([makeProperty('p:1', 'hasFoo'), makeProperty('p:2', 'hasBar')]);
      component.filterControl.setValue('FOO');
      flushFilter();
      const rows = fixture.nativeElement.querySelectorAll('app-property-row');
      expect(rows.length).toBe(1);
    }));

    it('filters out used properties when unusedOnly is on', fakeAsync(() => {
      setup();
      currentProjectsProperties$.next([
        makeProperty('p:1', 'hasFoo', { usedByClasses: [{ id: 'iri:A' }] }),
        makeProperty('p:2', 'hasBar'),
      ]);
      component.unusedOnlyControl.setValue(true);
      flushFilter();
      const rows = fixture.nativeElement.querySelectorAll('app-property-row');
      expect(rows.length).toBe(1);
    }));

    it('narrows by selected categories', fakeAsync(() => {
      setup();
      currentProjectsProperties$.next([
        makeProperty('p:1', 'hasFoo', { group: 'Text' }),
        makeProperty('p:2', 'hasBar', { group: 'Number' }),
      ]);
      component.toggleCategory('Number', true);
      flushFilter();
      const rows = fixture.nativeElement.querySelectorAll('app-property-row');
      expect(rows.length).toBe(1);
    }));

    it('shows empty state when no properties match', fakeAsync(() => {
      setup();
      currentProjectsProperties$.next([makeProperty('p:1', 'hasFoo')]);
      component.filterControl.setValue('zzz-no-match');
      flushFilter();
      expect(fixture.nativeElement.querySelector('[data-cy="property-library-empty"]')).toBeTruthy();
    }));

    it('clearFilter resets the filter input', () => {
      setup();
      component.filterControl.setValue('foo');
      component.clearFilter();
      expect(component.filterControl.value).toBe('');
    });
  });

  describe('view service mirroring', () => {
    it('forwards unusedOnly to the shared view state', fakeAsync(() => {
      setup();
      viewService.setUnusedPropertiesOnly.mockClear();
      component.unusedOnlyControl.setValue(true);
      flushFilter();
      expect(viewService.setUnusedPropertiesOnly).toHaveBeenCalledWith(true);
    }));

    it('forwards category selection to the shared view state', () => {
      setup();
      viewService.setPropertyCategoryFilters.mockClear();
      component.toggleCategory('Text', true);
      const last = viewService.setPropertyCategoryFilters.mock.calls.at(-1)?.[0] as Set<string>;
      expect(last.has('Text')).toBe(true);
    });

    it('forwards filter text to the shared view state', fakeAsync(() => {
      setup();
      viewService.setPropertyFilter.mockClear();
      component.filterControl.setValue('foo');
      flushFilter();
      expect(viewService.setPropertyFilter).toHaveBeenCalledWith('foo');
    }));
  });

  describe('drag lifecycle', () => {
    it('sets isPropertyDragging true on drag start', () => {
      setup();
      component.onPropertyDragStarted();
      expect(viewService.setPropertyDragging).toHaveBeenLastCalledWith(true);
    });

    it('sets isPropertyDragging false on drag end', () => {
      setup();
      component.onPropertyDragEnded();
      expect(viewService.setPropertyDragging).toHaveBeenLastCalledWith(false);
    });
  });

  describe('drop list scaffolding', () => {
    it('declares the static PROPERTY_LIBRARY_DROP_LIST_ID as its drop list id', fakeAsync(() => {
      setup();
      currentProjectsProperties$.next([makeProperty('p:1', 'hasFoo')]);
      flushFilter();
      const list = fixture.nativeElement.querySelector('[data-cy="property-library-list"]') as HTMLElement;
      expect(list).toBeTruthy();
      expect(list.id).toBe('property-library');
    }));
  });

  describe('category helpers', () => {
    it('exposes the full DefaultProperties category list', () => {
      setup();
      expect(component.categories.length).toBeGreaterThan(0);
      expect(component.categories).toContain('Text');
    });

    it('toggleCategory adds and removes categories from the active set', () => {
      setup();
      component.toggleCategory('Text', true);
      expect(component.isCategoryActive('Text')).toBe(true);
      component.toggleCategory('Text', false);
      expect(component.isCategoryActive('Text')).toBe(false);
    });
  });

  describe('trackByPropertyId', () => {
    it('returns the propDef.id', () => {
      setup();
      expect(component.trackByPropertyId(0, makeProperty('p:Z', 'z'))).toBe('p:Z');
    });
  });
});
