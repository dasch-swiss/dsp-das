import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APIV2ApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AccessTokenService } from '@dasch-swiss/vre/core/session';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ProjectPageService } from '../../project-page.service';
import { ResourceMetadataComponent } from './resource-metadata.component';

// jsdom's Blob implements neither arrayBuffer() nor text(), so FileReader is the only way to get at
// the raw bytes of a Blob under test.
const readBlobBytes = (blob: Blob): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });

describe('ResourceMetadataComponent', () => {
  let component: ResourceMetadataComponent;
  let fixture: ComponentFixture<ResourceMetadataComponent>;
  let mockV2ApiService: jest.Mocked<Pick<APIV2ApiService, 'getV2MetadataProjectsProjectshortcodeResources'>>;
  let createElementSpy: jest.SpyInstance;
  let createObjectURLSpy: jest.SpyInstance;

  const shortcode = '0810';
  const csvText = 'label,description\nMuseum für Kommunikation,Genève — Moritz Mähr\n';

  // The component defers the download by 1s so the success snackbar is visible first.
  const runDownload = () => {
    component.exportMetadata();
    jest.advanceTimersByTime(1000);
  };

  const lastAnchor = () =>
    createElementSpy.mock.results
      .map(result => result.value as HTMLElement)
      .filter((element): element is HTMLAnchorElement => element instanceof HTMLAnchorElement)
      .pop()!;

  beforeEach(async () => {
    jest.useFakeTimers();

    mockV2ApiService = {
      getV2MetadataProjectsProjectshortcodeResources: jest.fn().mockReturnValue(of(csvText)),
    } as any;

    createElementSpy = jest.spyOn(document, 'createElement');

    if (!window.URL.createObjectURL) window.URL.createObjectURL = jest.fn();
    if (!window.URL.revokeObjectURL) window.URL.revokeObjectURL = jest.fn();
    createObjectURLSpy = jest.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    jest.spyOn(window.URL, 'revokeObjectURL').mockImplementation();

    await TestBed.configureTestingModule({
      imports: [ResourceMetadataComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: APIV2ApiService, useValue: mockV2ApiService },
        { provide: AccessTokenService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
        { provide: ProjectPageService, useValue: { currentProject$: of({ shortcode }) } },
        provideTranslateService(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceMetadataComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('exportMetadata', () => {
    // DEV-6987: the filename was built without any extension, so the download did not open as a
    // spreadsheet at all.
    it('names the downloaded file with a .csv extension', () => {
      runDownload();

      expect(lastAnchor().download).toBe(`project_${shortcode}_metadata.csv`);
    });

    // DEV-6987: without the BOM, Excel/Numbers on macOS decode the file as Mac OS Roman and render
    // "für" as "f√ºr". The BOM is the only thing that tells them the file is UTF-8.
    it('prefixes the CSV with a UTF-8 BOM so spreadsheet apps decode non-ASCII correctly', async () => {
      runDownload();

      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
      // Real timers are needed for FileReader, which is asynchronous.
      jest.useRealTimers();
      const bytes = await readBlobBytes(blobArg);

      // Asserted at byte level, not as a decoded string: UTF-8 decoding strips a leading BOM, so a
      // string-level assertion would pass against the unfixed code too.
      expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
      // "für" must still be the precomposed two-byte c3 bc — the BOM is the only change.
      expect(new TextDecoder('utf-8').decode(bytes.slice(3))).toBe(csvText);
      expect(blobArg.type).toBe('text/csv;charset=utf-8');
    });
  });
});
