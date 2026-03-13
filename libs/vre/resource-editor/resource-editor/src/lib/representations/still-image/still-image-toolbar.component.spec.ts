import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Constants, KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ResourceFetcherService } from '../resource-fetcher.service';
import { OpenSeaDragonService } from './open-sea-dragon.service';
import { StillImageToolbarComponent } from './still-image-toolbar.component';

describe('StillImageToolbarComponent', () => {
  let component: StillImageToolbarComponent;
  let fixture: ComponentFixture<StillImageToolbarComponent>;

  const mockSvgResource: ReadResource = {
    id: 'http://rdfh.ch/0001/svg-resource',
    type: 'http://api.knora.org/ontology/knora-api/v2#StillImageRepresentation',
    label: 'SVG Resource',
    properties: {
      [Constants.HasStillImageFileValue]: [
        {
          id: 'http://rdfh.ch/0001/svg-value',
          type: Constants.StillImageVectorFileValue,
          fileUrl: 'http://example.com/test.svg',
          arkUrl: 'http://ark.example.com/test',
          strval: 'test.svg',
        },
      ],
    },
  } as unknown as ReadResource;

  const mockRasterResource: ReadResource = {
    id: 'http://rdfh.ch/0001/raster-resource',
    type: 'http://api.knora.org/ontology/knora-api/v2#StillImageRepresentation',
    label: 'Raster Resource',
    properties: {
      [Constants.HasStillImageFileValue]: [
        {
          id: 'http://rdfh.ch/0001/raster-value',
          type: Constants.StillImageFileValue,
          fileUrl: 'http://example.com/test.jpg',
          arkUrl: 'http://ark.example.com/test',
          strval: 'test.jpg',
        },
      ],
    },
  } as unknown as ReadResource;

  beforeEach(async () => {
    const mockOsdService = {
      drawing: false,
      toggleDrawing: jest.fn(),
      zoom: jest.fn(),
      viewer: { viewport: { goHome: jest.fn() }, setFullScreen: jest.fn() },
    };

    const mockMatIconRegistry = {
      addSvgIcon: jest.fn(),
    };

    const mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-url'),
    };

    await TestBed.configureTestingModule({
      imports: [StillImageToolbarComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideTranslateService(),
        { provide: NotificationService, useValue: { openSnackBar: jest.fn() } },
        { provide: DspApiConnectionToken, useValue: {} as KnoraApiConnection },
        { provide: ResourceFetcherService, useValue: { userCanEdit$: of(true) } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: OpenSeaDragonService, useValue: mockOsdService },
        { provide: MatIconRegistry, useValue: mockMatIconRegistry },
        { provide: DomSanitizer, useValue: mockDomSanitizer },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StillImageToolbarComponent);
    component = fixture.componentInstance;
    component.compoundMode = false;
    component.isPng = false;
  });

  it('should disable annotation for SVG images', () => {
    component.resource = mockSvgResource;
    fixture.detectChanges();

    expect(component.isAnnotatable).toBe(false);
    expect(component.isReadStillImageVectorFileValue).toBe(true);

    const regionButton = fixture.nativeElement.querySelector('[data-cy="still-image-region-button"]');
    expect(regionButton).toBeNull();
  });

  it('should show background button and disable settings for SVG', () => {
    component.resource = mockSvgResource;
    fixture.detectChanges();

    const bgButton = fixture.nativeElement.querySelector('[data-cy="still-image-bg-button"]');
    expect(bgButton).toBeTruthy();

    const settingsButton = fixture.nativeElement.querySelector('[data-cy="still-image-settings-button"]');
    expect(settingsButton.classList.contains('disabled')).toBe(true);
  });

  it('should enable annotation and hide background button for raster images', () => {
    component.resource = mockRasterResource;
    fixture.detectChanges();

    expect(component.isAnnotatable).toBe(true);
    expect(component.isReadStillImageVectorFileValue).toBe(false);

    const bgButton = fixture.nativeElement.querySelector('[data-cy="still-image-bg-button"]');
    expect(bgButton).toBeNull();

    const settingsButton = fixture.nativeElement.querySelector('[data-cy="still-image-settings-button"]');
    expect(settingsButton.classList.contains('disabled')).toBe(false);
  });
});