import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadResource, ReadValue, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ResourceFetcherService } from '../representations/resource-fetcher.service';
import { DraggableValueListComponent } from './draggable-value-list.component';
import { ValueOrderService } from './value-order.service';

describe('DraggableValueListComponent', () => {
  let component: DraggableValueListComponent;
  let fixture: ComponentFixture<DraggableValueListComponent>;
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

  const mockDropEvent = (previousIndex: number, currentIndex: number): CdkDragDrop<ReadValue[]> =>
    ({ previousIndex, currentIndex }) as CdkDragDrop<ReadValue[]>;

  beforeEach(async () => {
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
      imports: [DraggableValueListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ResourceFetcherService, useValue: mockResourceFetcherService },
        { provide: ValueOrderService, useValue: mockValueOrderService },
        { provide: NotificationService, useValue: mockNotificationService },
        provideTranslateService(),
      ],
    })
      .overrideComponent(DraggableValueListComponent, {
        set: { template: '<div>Mock Template</div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DraggableValueListComponent);
    component = fixture.componentInstance;
    component.values = [...mockValues];
    component.resourceIri = mockResource.id;
    component.propertyIri = mockPropDef.id;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
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

    it('should optimistically update values and emit before server response', () => {
      let capturedValues: ReadValue[] | undefined;
      const emittedValues: ReadValue[][] = [];
      component.valuesChange.subscribe(v => emittedValues.push(v));

      mockValueOrderService.reorderValues = jest.fn().mockImplementation(() => {
        capturedValues = [...component.values];
        return of({ resourceIri: mockResource.id, propertyIri: mockPropDef.id, valuesReordered: 3 });
      });

      component.onDrop(mockDropEvent(2, 0));

      expect(capturedValues![0].id).toBe('http://rdfh.ch/0001/value-3');
      expect(capturedValues![1].id).toBe('http://rdfh.ch/0001/value-1');
      expect(capturedValues![2].id).toBe('http://rdfh.ch/0001/value-2');
      expect(emittedValues.length).toBeGreaterThanOrEqual(1);
      expect(emittedValues[0][0].id).toBe('http://rdfh.ch/0001/value-3');
    });

    it('should revert values and emit on error', () => {
      mockValueOrderService.reorderValues = jest.fn().mockReturnValue(throwError(() => ({ status: 500 })));
      const emittedValues: ReadValue[][] = [];
      component.valuesChange.subscribe(v => emittedValues.push(v));

      const originalIds = component.values.map(v => v.id);
      component.onDrop(mockDropEvent(0, 2));

      expect(component.values.map(v => v.id)).toEqual(originalIds);
      // Last emission should be the original order (rollback)
      const lastEmission = emittedValues[emittedValues.length - 1];
      expect(lastEmission.map(v => v.id)).toEqual(originalIds);
    });

    it('should prevent concurrent drops via reorderLoading guard', () => {
      component.reorderLoading = true;
      component.onDrop(mockDropEvent(0, 1));
      expect(mockValueOrderService.reorderValues).not.toHaveBeenCalled();
    });

    it('should prevent drops when disabled', () => {
      component.disabled = true;
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
