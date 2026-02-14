import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Cardinality,
  ReadResource,
  ReadTextValueAsXml,
  ReadValue,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ResourceFetcherService } from '../representations/resource-fetcher.service';
import { PropertyValueService } from './property-value.service';
import { PropertyValuesComponent } from './property-values.component';
import { ValueOrderService } from './value-order.service';

describe('PropertyValuesComponent', () => {
  let component: PropertyValuesComponent;
  let fixture: ComponentFixture<PropertyValuesComponent>;
  let mockPropertyValueService: jest.Mocked<Partial<PropertyValueService>>;
  let mockResourceFetcherService: jest.Mocked<Partial<ResourceFetcherService>>;
  let mockValueOrderService: jest.Mocked<Partial<ValueOrderService>>;
  let mockNotificationService: jest.Mocked<Partial<NotificationService>>;

  const mockValues = [
    {
      id: 'http://rdfh.ch/0001/value-1',
      type: 'text',
      userHasPermission: 'M',
      strval: 'Alpha',
    } as unknown as ReadValue,
    { id: 'http://rdfh.ch/0001/value-2', type: 'text', userHasPermission: 'M', strval: 'Beta' } as unknown as ReadValue,
    {
      id: 'http://rdfh.ch/0001/value-3',
      type: 'text',
      userHasPermission: 'M',
      strval: 'Gamma',
    } as unknown as ReadValue,
  ];

  const mockResource = {
    id: 'http://rdfh.ch/0001/resource-1',
    type: 'anything:Thing',
    userHasPermission: 'M',
  } as unknown as ReadResource;

  const mockPropDef = {
    id: 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasText',
    objectType: 'http://api.knora.org/ontology/knora-api/v2#TextValue',
  } as ResourcePropertyDefinition;

  const mockMyProperty = {
    propDef: mockPropDef,
    guiDef: { cardinality: Cardinality._0_n },
    values: mockValues,
  } as unknown as PropertyInfoValues;

  const mockDropEvent = (previousIndex: number, currentIndex: number): CdkDragDrop<ReadValue[]> =>
    ({ previousIndex, currentIndex }) as CdkDragDrop<ReadValue[]>;

  beforeEach(async () => {
    mockPropertyValueService = {
      editModeData: { resource: mockResource, values: mockValues },
      propertyDefinition: mockPropDef,
      cardinality: Cardinality._0_n,
      lastOpenedItem$: new BehaviorSubject<number | null>(null),
    } as any;

    mockResourceFetcherService = {
      resourceVersion: undefined,
      reload: jest.fn(),
    };

    mockValueOrderService = {
      reorderValues: jest
        .fn()
        .mockReturnValue(of({ resourceIri: mockResource.id, propertyIri: mockPropDef.id, valuesReordered: 3 })),
    };

    mockNotificationService = {
      openSnackBar: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PropertyValuesComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: PropertyValueService, useValue: mockPropertyValueService },
        { provide: ResourceFetcherService, useValue: mockResourceFetcherService },
        { provide: ValueOrderService, useValue: mockValueOrderService },
        { provide: NotificationService, useValue: mockNotificationService },
        provideTranslateService(),
        TranslateService,
      ],
    })
      .overrideComponent(PropertyValuesComponent, {
        set: {
          template: '<div>Mock Template</div>',
          providers: [{ provide: PropertyValueService, useValue: mockPropertyValueService }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PropertyValuesComponent);
    component = fixture.componentInstance;
    component.editModeData = { resource: mockResource, values: [...mockValues] };
    component.myProperty = mockMyProperty;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('canReorder', () => {
    it('should return true when user has modify permission and not viewing old version', () => {
      expect(component.canReorder).toBe(true);
    });

    it('should return false when viewing historical resource version', () => {
      mockResourceFetcherService.resourceVersion = '20230101T000000Z';
      expect(component.canReorder).toBe(false);
    });
  });

  describe('isAnyValueEditing', () => {
    it('should return false when no value is being edited', () => {
      expect(component.isAnyValueEditing).toBe(false);
    });

    it('should return true when a value is being edited', () => {
      mockPropertyValueService.lastOpenedItem$!.next(1);
      expect(component.isAnyValueEditing).toBe(true);
    });
  });

  describe('getValueSummary', () => {
    it('should return strval when present', () => {
      const value = { strval: 'Alpha' } as unknown as ReadValue;
      expect(component.getValueSummary(value, 0)).toBe('Alpha');
    });

    it('should truncate long strval to 80 chars', () => {
      const value = { strval: 'A'.repeat(100) } as unknown as ReadValue;
      const result = component.getValueSummary(value, 0);
      expect(result.length).toBe(80);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should fallback to "Value N" when strval is undefined', () => {
      const value = { strval: undefined } as unknown as ReadValue;
      expect(component.getValueSummary(value, 2)).toBe('Value 3');
    });

    it('should fallback to "Value N" when strval is empty string', () => {
      const value = { strval: '' } as unknown as ReadValue;
      expect(component.getValueSummary(value, 0)).toBe('Value 1');
    });

    it('should fallback to "Value N" when strval is whitespace only', () => {
      const value = { strval: '   ' } as unknown as ReadValue;
      expect(component.getValueSummary(value, 0)).toBe('Value 1');
    });

    it('should not truncate string of exactly 80 chars', () => {
      const value = { strval: 'A'.repeat(80) } as unknown as ReadValue;
      expect(component.getValueSummary(value, 0)).toBe('A'.repeat(80));
    });

    it('should truncate string of 81 chars', () => {
      const value = { strval: 'A'.repeat(81) } as unknown as ReadValue;
      const result = component.getValueSummary(value, 0);
      expect(result.length).toBe(80);
      expect(result).toBe('A'.repeat(77) + '...');
    });

    describe('ReadTextValueAsXml handling', () => {
      const makeXmlValue = (strval: string): ReadValue => {
        const v = Object.create(ReadTextValueAsXml.prototype);
        v.strval = strval;
        return v as ReadValue;
      };

      it('should strip XML wrapper and HTML tags from ReadTextValueAsXml', () => {
        const value = makeXmlValue('<?xml version="1.0" encoding="UTF-8"?><text><p>Hello world</p></text>');
        expect(component.getValueSummary(value, 0)).toBe('Hello world');
      });

      it('should strip nested formatting tags', () => {
        const value = makeXmlValue(
          '<?xml version="1.0" encoding="UTF-8"?><text><p>Some <strong>bold</strong> and <em>italic</em> text</p></text>'
        );
        expect(component.getValueSummary(value, 0)).toBe('Some bold and italic text');
      });

      it('should fall back to "Value N" when XML content is empty after stripping', () => {
        const value = makeXmlValue('<?xml version="1.0" encoding="UTF-8"?><text></text>');
        expect(component.getValueSummary(value, 2)).toBe('Value 3');
      });

      it('should truncate long extracted text at 80 chars', () => {
        const longText = 'A'.repeat(100);
        const value = makeXmlValue(`<?xml version="1.0" encoding="UTF-8"?><text><p>${longText}</p></text>`);
        const result = component.getValueSummary(value, 0);
        expect(result.length).toBe(80);
        expect(result.endsWith('...')).toBe(true);
      });

      it('should strip self-closing footnote tags', () => {
        const value = makeXmlValue(
          '<?xml version="1.0" encoding="UTF-8"?><text><p>Text with note<footnote content="a note"/></p></text>'
        );
        expect(component.getValueSummary(value, 0)).toBe('Text with note');
      });

      it('should decode XML entities', () => {
        const value = makeXmlValue(
          '<?xml version="1.0" encoding="UTF-8"?><text><p>A &amp; B &lt; C &gt; D &quot;E&quot;</p></text>'
        );
        expect(component.getValueSummary(value, 0)).toBe('A & B < C > D "E"');
      });

      it('should decode &apos; entity via DOMParser', () => {
        const value = makeXmlValue(
          '<?xml version="1.0" encoding="UTF-8"?><text><p>It&apos;s a test</p></text>'
        );
        expect(component.getValueSummary(value, 0)).toBe("It's a test");
      });
    });
  });

  describe('dragDropDisabled', () => {
    it('should be false when user can reorder and no editing/adding/loading is active', () => {
      expect(component.dragDropDisabled).toBe(false);
    });

    it('should be true when user cannot reorder (historical version)', () => {
      mockResourceFetcherService.resourceVersion = '20230101T000000Z';
      expect(component.dragDropDisabled).toBe(true);
    });

    it('should be true when a value is being edited', () => {
      mockPropertyValueService.lastOpenedItem$!.next(1);
      expect(component.dragDropDisabled).toBe(true);
    });

    it('should be true when currently adding a value', () => {
      component.currentlyAdding = true;
      expect(component.dragDropDisabled).toBe(true);
    });

    it('should be true when reorder is loading', () => {
      component.reorderLoading = true;
      expect(component.dragDropDisabled).toBe(true);
    });
  });

  describe('onDrop', () => {
    it('should not call reorder when dropped at same position', () => {
      component.onDrop(mockDropEvent(1, 1));
      expect(mockValueOrderService.reorderValues).not.toHaveBeenCalled();
    });

    it('should call reorder service with correctly reordered IRI list', () => {
      component.onDrop(mockDropEvent(2, 0));
      expect(mockValueOrderService.reorderValues).toHaveBeenCalledWith(mockResource.id, mockPropDef.id, [
        'http://rdfh.ch/0001/value-3',
        'http://rdfh.ch/0001/value-1',
        'http://rdfh.ch/0001/value-2',
      ]);
    });

    it('should reload resource after successful reorder', () => {
      component.onDrop(mockDropEvent(0, 2));
      expect(mockResourceFetcherService.reload).toHaveBeenCalled();
    });

    it('should optimistically update data model before server response', () => {
      // Use a delayed observable to check intermediate state
      let capturedValues: ReadValue[] | undefined;
      mockValueOrderService.reorderValues = jest.fn().mockImplementation(() => {
        capturedValues = [...component.editModeData.values];
        return of({ resourceIri: mockResource.id, propertyIri: mockPropDef.id, valuesReordered: 3 });
      });

      component.onDrop(mockDropEvent(2, 0));

      // The data model should have been reordered before the service call resolved
      expect(capturedValues![0].id).toBe('http://rdfh.ch/0001/value-3');
      expect(capturedValues![1].id).toBe('http://rdfh.ch/0001/value-1');
      expect(capturedValues![2].id).toBe('http://rdfh.ch/0001/value-2');
    });

    it('should revert data model on error', () => {
      mockValueOrderService.reorderValues = jest.fn().mockReturnValue(throwError(() => ({ status: 500 })));
      const originalIds = component.editModeData.values.map(v => v.id);
      component.onDrop(mockDropEvent(0, 2));
      expect(component.editModeData.values.map(v => v.id)).toEqual(originalIds);
    });

    it('should prevent concurrent drops via reorderLoading guard', () => {
      component.reorderLoading = true;
      component.onDrop(mockDropEvent(0, 1));
      expect(mockValueOrderService.reorderValues).not.toHaveBeenCalled();
    });

    it('should prevent drops while adding a value (currentlyAdding guard)', () => {
      component.currentlyAdding = true;
      component.onDrop(mockDropEvent(0, 1));
      expect(mockValueOrderService.reorderValues).not.toHaveBeenCalled();
    });
  });

  describe('reorderLoading', () => {
    it('should be false initially', () => {
      expect(component.reorderLoading).toBe(false);
    });

    it('should reset to false after successful reorder', () => {
      component.onDrop(mockDropEvent(0, 1));
      expect(component.reorderLoading).toBe(false);
    });

    it('should reset to false after failed reorder', () => {
      mockValueOrderService.reorderValues = jest.fn().mockReturnValue(throwError(() => ({ status: 500 })));
      component.onDrop(mockDropEvent(0, 1));
      expect(component.reorderLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should show stale notification and reload on 400 error', () => {
      mockValueOrderService.reorderValues = jest.fn().mockReturnValue(throwError(() => ({ status: 400 })));
      component.onDrop(mockDropEvent(0, 1));
      expect(mockNotificationService.openSnackBar).toHaveBeenCalledWith(
        'resourceEditor.resourceProperties.actions.reorderStale',
        'error'
      );
      expect(mockResourceFetcherService.reload).toHaveBeenCalled();
    });

    it('should show forbidden notification on 403 error', () => {
      mockValueOrderService.reorderValues = jest.fn().mockReturnValue(throwError(() => ({ status: 403 })));
      component.onDrop(mockDropEvent(0, 1));
      expect(mockNotificationService.openSnackBar).toHaveBeenCalledWith(
        'resourceEditor.resourceProperties.actions.reorderForbidden',
        'error'
      );
    });

    it('should show generic failure notification on other errors', () => {
      mockValueOrderService.reorderValues = jest.fn().mockReturnValue(throwError(() => ({ status: 500 })));
      component.onDrop(mockDropEvent(0, 1));
      expect(mockNotificationService.openSnackBar).toHaveBeenCalledWith(
        'resourceEditor.resourceProperties.actions.reorderFailed',
        'error'
      );
    });
  });
});
