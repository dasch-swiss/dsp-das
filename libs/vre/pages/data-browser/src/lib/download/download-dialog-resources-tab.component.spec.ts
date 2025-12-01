import { HttpResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyDefinition } from '@dasch-swiss/dsp-js';
import { APIV3ApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { DownloadDialogResourcesTabComponent } from './download-dialog-resources-tab.component';

describe('DownloadDialogResourcesTabComponent', () => {
  let component: DownloadDialogResourcesTabComponent;
  let fixture: ComponentFixture<DownloadDialogResourcesTabComponent>;
  let mockV3ApiService: jest.Mocked<APIV3ApiService>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockLocalizationService: jest.Mocked<LocalizationService>;

  // Mock DOM methods
  let createElementSpy: jest.SpyInstance;
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let createObjectURLSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;
  let mockAnchorElement: any;

  // Mock property definitions
  const createMockPropertyInfo = (id: string, label: string): PropertyInfoValues => ({
    propDef: {
      id,
      label,
    } as PropertyDefinition,
    guiDef: {} as any,
    values: [],
  });

  const mockProperty1 = createMockPropertyInfo('prop-1', 'Title');
  const mockProperty2 = createMockPropertyInfo('prop-2', 'Description');

  beforeEach(async () => {
    // Create mock services
    mockV3ApiService = {
      postV3ExportResources: jest.fn() as any,
    } as any;

    mockNotificationService = {
      openSnackBar: jest.fn(),
    } as any;

    mockLocalizationService = {
      getCurrentLanguage: jest.fn().mockReturnValue('en'),
    } as any;

    // Mock DOM methods
    mockAnchorElement = {
      href: '',
      download: '',
      click: jest.fn(),
    };

    createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchorElement);
    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
    removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();
    createObjectURLSpy = jest.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = jest.spyOn(window.URL, 'revokeObjectURL').mockImplementation();

    await TestBed.configureTestingModule({
      declarations: [DownloadDialogResourcesTabComponent],
      imports: [TranslateModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: APIV3ApiService, useValue: mockV3ApiService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: LocalizationService, useValue: mockLocalizationService },
      ],
    })
      .overrideComponent(DownloadDialogResourcesTabComponent, {
        set: {
          // Template is overridden to isolate unit test from template rendering
          template: '<div>Mock Template</div>',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DownloadDialogResourcesTabComponent);
    component = fixture.componentInstance;

    // Set required inputs
    component.properties = [mockProperty1, mockProperty2];
    component.resourceClassIri = 'http://example.org/ontology/ResourceClass';
  });

  afterEach(() => {
    jest.clearAllMocks();
    createElementSpy?.mockRestore();
    appendChildSpy?.mockRestore();
    removeChildSpy?.mockRestore();
    createObjectURLSpy?.mockRestore();
    revokeObjectURLSpy?.mockRestore();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have includeResourceIris set to false', () => {
      expect(component.includeResourceIris).toBe(false);
    });

    it('should have isDownloading set to false', () => {
      expect(component.isDownloading).toBe(false);
    });

    it('should have empty selectedPropertyIds', () => {
      expect(component.selectedPropertyIds).toEqual([]);
    });
  });

  describe('downloadCsv', () => {
    const mockCsvText = 'id,title,description\n1,Test,Test description';

    beforeEach(() => {
      component.selectedPropertyIds = ['prop-1', 'prop-2'];
      (mockV3ApiService.postV3ExportResources as any).mockReturnValue(of(mockCsvText));
    });

    it('should set isDownloading to true when starting download', () => {
      (mockV3ApiService.postV3ExportResources as any).mockReturnValue(of(mockCsvText));

      component.downloadCsv();

      // Check immediately after calling (before observable completes)
      expect(component.isDownloading).toBe(true);
    });

    it('should call API with correct parameters', () => {
      component.includeResourceIris = false;
      component.selectedPropertyIds = ['prop-1', 'prop-2'];

      component.downloadCsv();

      expect(mockV3ApiService.postV3ExportResources).toHaveBeenCalledWith(
        {
          resourceClass: 'http://example.org/ontology/ResourceClass',
          selectedProperties: ['prop-1', 'prop-2'],
          language: 'en',
          includeIris: false,
        },
        undefined,
        undefined,
        { httpHeaderAccept: 'text/csv' }
      );
    });

    it('should call API with includeIris=true when checkbox is checked', () => {
      component.includeResourceIris = true;
      component.selectedPropertyIds = ['prop-1'];

      component.downloadCsv();

      expect(mockV3ApiService.postV3ExportResources).toHaveBeenCalledWith(
        expect.objectContaining({
          includeIris: true,
        }),
        undefined,
        undefined,
        { httpHeaderAccept: 'text/csv' }
      );
    });

    it('should use current language from localization service', () => {
      mockLocalizationService.getCurrentLanguage.mockReturnValue('de');

      component.downloadCsv();

      expect(mockV3ApiService.postV3ExportResources).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'de',
        }),
        undefined,
        undefined,
        { httpHeaderAccept: 'text/csv' }
      );
    });

    it('should create blob with CSV data', done => {
      (mockV3ApiService.postV3ExportResources as any).mockReturnValue(of(mockCsvText));

      component.downloadCsv();

      setTimeout(() => {
        expect(createObjectURLSpy).toHaveBeenCalled();
        const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
        expect(blobArg.type).toBe('text/csv');
        done();
      }, 0);
    });

    it('should create download link and trigger click', done => {
      (mockV3ApiService.postV3ExportResources as any).mockReturnValue(of(mockCsvText));

      component.downloadCsv();

      setTimeout(() => {
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(mockAnchorElement.href).toBe('blob:mock-url');
        expect(mockAnchorElement.download).toMatch(/resources_export_\d{4}-\d{2}-\d{2}\.csv/);
        expect(appendChildSpy).toHaveBeenCalledWith(mockAnchorElement);
        expect(mockAnchorElement.click).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalledWith(mockAnchorElement);
        done();
      }, 0);
    });

    it('should revoke object URL after download', done => {
      (mockV3ApiService.postV3ExportResources as any).mockReturnValue(of(mockCsvText));

      component.downloadCsv();

      setTimeout(() => {
        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
        done();
      }, 0);
    });

    it('should show success notification on successful download', done => {
      (mockV3ApiService.postV3ExportResources as any).mockReturnValue(of(mockCsvText));

      component.downloadCsv();

      setTimeout(() => {
        expect(mockNotificationService.openSnackBar).toHaveBeenCalledWith(
          'pages.dataBrowser.downloadDialog.downloadSuccess'
        );
        done();
      }, 0);
    });

    it('should emit afterClosed event on successful download', done => {
      (mockV3ApiService.postV3ExportResources as any).mockReturnValue(of(mockCsvText));
      const emitSpy = jest.spyOn(component.afterClosed, 'emit');

      component.downloadCsv();

      setTimeout(() => {
        expect(emitSpy).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should set isDownloading to false after successful download', done => {
      (mockV3ApiService.postV3ExportResources as any).mockReturnValue(of(mockCsvText));

      component.downloadCsv();

      setTimeout(() => {
        expect(component.isDownloading).toBe(false);
        done();
      }, 0);
    });

    it('should show error notification on API failure', done => {
      const error = new Error('API Error');
      mockV3ApiService.postV3ExportResources.mockReturnValue(throwError(() => error));

      component.downloadCsv();

      setTimeout(() => {
        expect(mockNotificationService.openSnackBar).toHaveBeenCalledWith(
          'pages.dataBrowser.downloadDialog.downloadError'
        );
        done();
      }, 0);
    });

    it('should set isDownloading to false after error', done => {
      const error = new Error('API Error');
      mockV3ApiService.postV3ExportResources.mockReturnValue(throwError(() => error));

      component.downloadCsv();

      setTimeout(() => {
        expect(component.isDownloading).toBe(false);
        done();
      }, 0);
    });

    it('should not emit afterClosed on error', done => {
      const error = new Error('API Error');
      mockV3ApiService.postV3ExportResources.mockReturnValue(throwError(() => error));
      const emitSpy = jest.spyOn(component.afterClosed, 'emit');

      component.downloadCsv();

      setTimeout(() => {
        expect(emitSpy).not.toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not create blob on error', done => {
      const error = new Error('API Error');
      mockV3ApiService.postV3ExportResources.mockReturnValue(throwError(() => error));

      component.downloadCsv();

      setTimeout(() => {
        expect(createObjectURLSpy).not.toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('selectedPropertyIds', () => {
    it('should update when property selection changes', () => {
      expect(component.selectedPropertyIds).toEqual([]);

      component.selectedPropertyIds = ['prop-1', 'prop-2'];

      expect(component.selectedPropertyIds).toEqual(['prop-1', 'prop-2']);
    });
  });

  describe('includeResourceIris toggle', () => {
    it('should start as false', () => {
      expect(component.includeResourceIris).toBe(false);
    });

    it('should be toggleable', () => {
      component.includeResourceIris = true;
      expect(component.includeResourceIris).toBe(true);

      component.includeResourceIris = false;
      expect(component.includeResourceIris).toBe(false);
    });
  });
});
