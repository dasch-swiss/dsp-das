import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import type { PropertyInfo } from '../ontology.types';
import { PropertyRowComponent } from './property-row.component';

const makeProperty = (id: string, label: string, options: { icon?: string; group?: string } = {}): PropertyInfo =>
  ({
    propDef: { id, label, labels: [] },
    propType: { icon: options.icon ?? 'short_text', group: options.group ?? 'Text' },
    usedByClasses: [],
  }) as unknown as PropertyInfo;

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
            currentLanguage: 'en',
          },
        },
      ],
    });

    fixture = TestBed.createComponent(PropertyRowComponent);
    component = fixture.componentInstance;
    component.property = makeProperty('prop:1', 'hasFoo');
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
  });

  describe('editingEnabled', () => {
    it('hides the drag handle when editingEnabled is false', () => {
      setup();
      fixture.componentRef.setInput('editingEnabled', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-cy="property-row-drag"]')).toBeNull();
    });

    it('shows the drag handle by default', () => {
      setup();
      expect(fixture.nativeElement.querySelector('[data-cy="property-row-drag"]')).toBeTruthy();
    });
  });
});
