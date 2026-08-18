import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadFileValue } from '@dasch-swiss/dsp-js';
import { AdminAPIApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { PLACEHOLDER_FILE_SENTINEL } from './is-placeholder-file-value';
import { ResourceFetcherService } from './resource-fetcher.service';
import { ResourceLegalComponent } from './resource-legal.component';

describe('ResourceLegalComponent placeholder rendering (DEV-6982)', () => {
  let fixture: ComponentFixture<ResourceLegalComponent>;
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceLegalComponent],
      providers: [
        provideTranslateService(),
        { provide: ResourceFetcherService, useValue: { projectShortcode$: of('0001') } },
        {
          provide: AdminAPIApiService,
          useValue: {
            getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses: () => of({ data: [] }),
          },
        },
      ],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      resourceEditor: {
        legal: {
          copyrightHolder: 'Copyright holder',
          authorship: 'Authorship',
          license: 'License',
          placeholder: 'Placeholder',
        },
      },
    });
    translate.setTranslation('de', {
      resourceEditor: {
        legal: {
          copyrightHolder: 'Urheberrechtsinhaber',
          authorship: 'Autorenschaft',
          license: 'Lizenz',
          placeholder: 'Platzhalter',
        },
      },
    });
    translate.use('en');

    fixture = TestBed.createComponent(ResourceLegalComponent);
    fixture.componentRef.setInput('fileValue', {
      copyrightHolder: PLACEHOLDER_FILE_SENTINEL,
      authorship: ['Ada Lovelace', PLACEHOLDER_FILE_SENTINEL],
      license: null,
    } as unknown as ReadFileValue);
    fixture.detectChanges();
  });

  const text = () => (fixture.nativeElement as HTMLElement).textContent!.replace(/\s+/g, ' ').trim();

  it('joins authorship with ", " in the real text node (copy/paste + screen readers)', () => {
    expect(text()).toContain('Ada Lovelace, Placeholder');
    expect(text()).not.toContain('Ada LovelacePlaceholder');
  });

  // Guards that the marker is translated (not a hardcoded string or a raw key) and follows the
  // active language, rather than proving any particular change-detection behaviour.
  it('renders the marker in the active language', () => {
    expect(text()).toContain('Placeholder');

    translate.use('de');
    fixture.detectChanges();

    expect(text()).toContain('Platzhalter');
    expect(text()).toContain('Ada Lovelace, Platzhalter');
    expect(text()).not.toContain('Placeholder');
  });
});
