import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import type { PropertyInfo, ResourceClassInfo } from '../ontology.types';
import { PropertyRowComponent } from './property-row.component';

const makeProperty = (
  id: string,
  label: string,
  options: { usedByClasses?: { id: string }[]; icon?: string; group?: string } = {}
): PropertyInfo =>
  ({
    propDef: { id, label, labels: [] },
    propType: { icon: options.icon ?? 'short_text', group: options.group ?? 'Text' },
    usedByClasses: options.usedByClasses ?? [],
  }) as unknown as PropertyInfo;

const makeClass = (id: string, label: string): ResourceClassInfo =>
  ({ id, label, labels: [] }) as unknown as ResourceClassInfo;

describe('PropertyRowComponent', () => {
  let fixture: ComponentFixture<PropertyRowComponent>;
  let component: PropertyRowComponent;

  const setup = () => {
    TestBed.configureTestingModule({
      imports: [PropertyRowComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        {
          provide: LocalizationService,
          useValue: {
            currentLanguage$: new BehaviorSubject('en'),
            getCurrentLanguage: () => 'en',
          },
        },
      ],
    });

    fixture = TestBed.createComponent(PropertyRowComponent);
    component = fixture.componentInstance;
    component.property = makeProperty('prop:1', 'hasFoo');
    component.assignableClasses = [];
    fixture.detectChanges();
  };

  describe('label and icon resolution', () => {
    it('falls back to the property label when labels[] is empty', () => {
      setup();
      expect(component.label).toBe('hasFoo');
    });

    it('returns the propType icon', () => {
      setup();
      component.property = makeProperty('prop:1', 'hasFoo', { icon: 'tag' });
      expect(component.icon).toBe('tag');
    });

    it('returns the propType group', () => {
      setup();
      component.property = makeProperty('prop:1', 'hasFoo', { group: 'Number' });
      expect(component.group).toBe('Number');
    });

    it('uses a fallback icon when propType.icon is missing', () => {
      setup();
      component.property = { ...makeProperty('p', 'x'), propType: {} as never } as PropertyInfo;
      expect(component.icon).toBe('data_object');
    });
  });

  describe('unassignedClasses', () => {
    it('excludes classes already in usedByClasses', () => {
      setup();
      component.property = makeProperty('prop:1', 'hasFoo', { usedByClasses: [{ id: 'iri:A' }] });
      component.assignableClasses = [makeClass('iri:A', 'A'), makeClass('iri:B', 'B')];
      fixture.detectChanges();
      expect(component.unassignedClasses).toEqual([{ iri: 'iri:B', label: 'B' }]);
    });

    it('returns all classes when usedByClasses is empty', () => {
      setup();
      component.assignableClasses = [makeClass('iri:A', 'A'), makeClass('iri:B', 'B')];
      fixture.detectChanges();
      expect(component.unassignedClasses.map(c => c.iri)).toEqual(['iri:A', 'iri:B']);
    });
  });

  describe('events', () => {
    it('emits dragStarted / dragEnded when the CDK lifecycle fires', () => {
      setup();
      const started = jest.fn();
      const ended = jest.fn();
      component.dragStarted.subscribe(started);
      component.dragEnded.subscribe(ended);

      component.onDragStarted();
      component.onDragEnded();

      expect(started).toHaveBeenCalledTimes(1);
      expect(ended).toHaveBeenCalledTimes(1);
    });

    it('emits assignToClass when a menu item is chosen', () => {
      setup();
      const assigned = jest.fn();
      component.assignToClass.subscribe(assigned);

      component.onAssign({ iri: 'iri:A', label: 'A' });

      expect(assigned).toHaveBeenCalledWith({ iri: 'iri:A', label: 'A' });
    });
  });

  describe('editingEnabled', () => {
    it('hides the drag handle and assign button when editingEnabled is false', () => {
      setup();
      fixture.componentRef.setInput('editingEnabled', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-cy="property-row-drag"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('[data-cy="property-row-assign"]')).toBeNull();
    });

    it('shows the drag handle and assign button by default', () => {
      setup();
      // assignableClasses default empty; assign button still renders but is disabled.
      expect(fixture.nativeElement.querySelector('[data-cy="property-row-drag"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-cy="property-row-assign"]')).toBeTruthy();
    });
  });
});
