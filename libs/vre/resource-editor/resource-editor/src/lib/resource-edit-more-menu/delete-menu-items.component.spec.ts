import { CUSTOM_ELEMENTS_SCHEMA, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CanDoResponse } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { DeleteMenuItemsComponent } from './delete-menu-items.component';

// Helper function to create CanDoResponse mocks
function createCanDoResponse(canDo: boolean, reason?: string): CanDoResponse {
  const response = new CanDoResponse();
  response.canDo = canDo;
  if (reason) {
    response.cannotDoReason = reason;
  }
  return response;
}

describe('DeleteMenuItemsComponent', () => {
  let component: DeleteMenuItemsComponent;
  let fixture: ComponentFixture<DeleteMenuItemsComponent>;

  const mockResource = {
    id: 'test-resource-id',
    type: 'test-type',
    lastModificationDate: '2023-01-01',
    incomingReferences: [],
    properties: {},
    userHasPermission: 'D',
  };

  const mockCanDeleteResource = jest.fn();

  const mockDspApiConnection = {
    v2: {
      res: {
        canDeleteResource: mockCanDeleteResource,
      },
    },
  };

  const userCanDelete$ = new BehaviorSubject(true);
  const mockResourceFetcher = { userCanDelete$ };

  const mockDialogRef = {
    afterClosed: jest.fn().mockReturnValue(of(false)),
  };

  const mockDialog = {
    open: jest.fn().mockReturnValue(mockDialogRef),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteMenuItemsComponent],
      imports: [TranslateModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: DspApiConnectionToken, useValue: mockDspApiConnection },
        { provide: ResourceFetcherService, useValue: mockResourceFetcher },
        { provide: ViewContainerRef, useValue: {} },
      ],
    })
      .overrideComponent(DeleteMenuItemsComponent, {
        set: {
          // Template is overridden to isolate unit test from template rendering
          // This tests only the component logic, not UI integration
          template: '<div>Mock Template</div>',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DeleteMenuItemsComponent);
    component = fixture.componentInstance;
    component.resource = mockResource as any;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userCanDelete$.next(true);
    mockCanDeleteResource.mockReturnValue(of(createCanDoResponse(true)));
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('permission checks', () => {
    it('should return canDo false when user lacks delete permission', async () => {
      userCanDelete$.next(false);
      component.ngOnInit();

      const response = await firstValueFrom(component.resourceCanBeDeleted$);

      expect(response.canDo).toBe(false);
      expect(response.cannotDoReason).toBe('resourceEditor.moreMenu.noPermission');
    });

    it('should return canDo true when user has permission and resource can be deleted', async () => {
      userCanDelete$.next(true);
      component.ngOnInit();

      const response = await firstValueFrom(component.resourceCanBeDeleted$);

      expect(response.canDo).toBe(true);
      expect(mockCanDeleteResource).toHaveBeenCalled();
    });

    it('should return resource cannot be deleted response when API returns canDo false', async () => {
      mockCanDeleteResource.mockReturnValue(of(createCanDoResponse(false, 'Resource has dependencies')));
      userCanDelete$.next(true);
      component.ngOnInit();

      const response = await firstValueFrom(component.resourceCanBeDeleted$);

      expect(response.canDo).toBe(false);
      expect(response.cannotDoReason).toBe('Resource has dependencies');
    });

    it('should call canDeleteResource with correct parameters', async () => {
      userCanDelete$.next(true);
      component.ngOnInit();

      await firstValueFrom(component.resourceCanBeDeleted$);

      expect(mockCanDeleteResource).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockResource.id,
          type: mockResource.type,
          lastModificationDate: mockResource.lastModificationDate,
        })
      );
    });
  });

  describe('dialog interactions', () => {
    // Helper function to test dialog behavior pattern
    const testDialogBehavior = (
      methodName: 'deleteResource' | 'eraseResource',
      eventEmitter: 'resourceDeleted' | 'resourceErased'
    ) => {
      describe(`${methodName}`, () => {
        it(`should open dialog with resource data and emit ${eventEmitter} when confirmed`, () => {
          mockDialogRef.afterClosed.mockReturnValue(of(true));
          const emitSpy = jest.spyOn(component[eventEmitter], 'emit');

          component[methodName]();

          expect(mockDialog.open).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ data: mockResource })
          );
          expect(emitSpy).toHaveBeenCalled();
        });

        it(`should not emit ${eventEmitter} when dialog is cancelled`, () => {
          mockDialogRef.afterClosed.mockReturnValue(of(false));
          const emitSpy = jest.spyOn(component[eventEmitter], 'emit');

          component[methodName]();

          expect(emitSpy).not.toHaveBeenCalled();
        });
      });
    };

    testDialogBehavior('deleteResource', 'resourceDeleted');
    testDialogBehavior('eraseResource', 'resourceErased');
  });
});
