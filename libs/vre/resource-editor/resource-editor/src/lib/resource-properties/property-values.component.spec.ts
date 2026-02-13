import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cardinality, ReadResource, ReadValue, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
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
    { id: 'http://rdfh.ch/0001/value-1', type: 'text', userHasPermission: 'M' } as unknown as ReadValue,
    { id: 'http://rdfh.ch/0001/value-2', type: 'text', userHasPermission: 'M' } as unknown as ReadValue,
    { id: 'http://rdfh.ch/0001/value-3', type: 'text', userHasPermission: 'M' } as unknown as ReadValue,
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
      reorderValues: jest.fn().mockReturnValue(of({ resourceIri: mockResource.id, propertyIri: mockPropDef.id, valuesReordered: 3 })),
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
    component.editModeData = { resource: mockResource, values: mockValues };
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

  describe('moveUp', () => {
    it('should not call reorder when index is 0', () => {
      component.moveUp(0);
      expect(mockValueOrderService.reorderValues).not.toHaveBeenCalled();
    });

    it('should call reorder service with correctly swapped IRI list', () => {
      component.moveUp(2);
      expect(mockValueOrderService.reorderValues).toHaveBeenCalledWith(
        mockResource.id,
        mockPropDef.id,
        ['http://rdfh.ch/0001/value-1', 'http://rdfh.ch/0001/value-3', 'http://rdfh.ch/0001/value-2']
      );
    });

    it('should reload resource after successful reorder', () => {
      component.moveUp(1);
      expect(mockResourceFetcherService.reload).toHaveBeenCalled();
    });
  });

  describe('moveDown', () => {
    it('should not call reorder when index is last', () => {
      component.moveDown(2);
      expect(mockValueOrderService.reorderValues).not.toHaveBeenCalled();
    });

    it('should call reorder service with correctly swapped IRI list', () => {
      component.moveDown(0);
      expect(mockValueOrderService.reorderValues).toHaveBeenCalledWith(
        mockResource.id,
        mockPropDef.id,
        ['http://rdfh.ch/0001/value-2', 'http://rdfh.ch/0001/value-1', 'http://rdfh.ch/0001/value-3']
      );
    });
  });

  describe('reorderLoading', () => {
    it('should be false initially', () => {
      expect(component.reorderLoading).toBe(false);
    });

    it('should reset to false after successful reorder', () => {
      component.moveUp(1);
      expect(component.reorderLoading).toBe(false);
    });

    it('should reset to false after failed reorder', () => {
      mockValueOrderService.reorderValues = jest.fn().mockReturnValue(throwError(() => ({ status: 500 })));
      component.moveUp(1);
      expect(component.reorderLoading).toBe(false);
    });

    it('should prevent rapid-fire calls', () => {
      component.reorderLoading = true;
      component.moveUp(1);
      expect(mockValueOrderService.reorderValues).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should show stale notification and reload on 400 error', () => {
      mockValueOrderService.reorderValues = jest.fn().mockReturnValue(throwError(() => ({ status: 400 })));
      component.moveUp(1);
      expect(mockNotificationService.openSnackBar).toHaveBeenCalledWith(
        'resourceEditor.resourceProperties.actions.reorderStale',
        'error'
      );
      expect(mockResourceFetcherService.reload).toHaveBeenCalled();
    });

    it('should show forbidden notification on 403 error', () => {
      mockValueOrderService.reorderValues = jest.fn().mockReturnValue(throwError(() => ({ status: 403 })));
      component.moveUp(1);
      expect(mockNotificationService.openSnackBar).toHaveBeenCalledWith(
        'resourceEditor.resourceProperties.actions.reorderForbidden',
        'error'
      );
    });

    it('should show generic failure notification on other errors', () => {
      mockValueOrderService.reorderValues = jest.fn().mockReturnValue(throwError(() => ({ status: 500 })));
      component.moveUp(1);
      expect(mockNotificationService.openSnackBar).toHaveBeenCalledWith(
        'resourceEditor.resourceProperties.actions.reorderFailed',
        'error'
      );
    });
  });
});
