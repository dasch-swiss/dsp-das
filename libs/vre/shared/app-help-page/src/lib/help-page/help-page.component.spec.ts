import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppConfigService } from '@dasch-swiss/vre/core/config';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { loadTranslations } from '../i18n.spec-helper';
import { HelpPageComponent } from './help-page.component';

type Tree = Record<string, any>;

describe('HelpPageComponent', () => {
  let fixture: ComponentFixture<HelpPageComponent>;
  let help: Tree;

  const appConfigMock = {
    dspConfig: { release: '1.2.3', environment: 'test', production: false, color: 'primary' },
    dspApiConfig: { apiProtocol: 'http', apiHost: 'localhost', apiPort: 3333 },
  };

  beforeEach(async () => {
    const enTranslations = loadTranslations('en');
    const deTranslations = loadTranslations('de');
    help = (deTranslations['pages'] as Tree)['help'] as Tree;

    await TestBed.configureTestingModule({
      imports: [HelpPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService(),
        { provide: AppConfigService, useValue: appConfigMock },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations);
    translate.setTranslation('de', deTranslations);
    // Assert in German: an English literal left hardcoded in the template would
    // still match the English translation, so it could not fail these tests.
    translate.use('de');

    fixture = TestBed.createComponent(HelpPageComponent);
    fixture.detectChanges();
    // The component requests /version on init; the response is irrelevant here.
    TestBed.inject(HttpTestingController).expectOne(req => req.url.endsWith('/version'));
  });

  it('translates the page headings', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain(help['needHelp']);
    expect(text).toContain(help['userGuide']);
    expect(text).toContain(help['software']['heading']);
    expect(text).toContain(help['support']['heading']);
  });

  it('translates the documentation cards', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain(help['docs']['projectAdmin']['title']);
    expect(text).toContain(help['docs']['dataModel']['title']);
    expect(text).toContain(help['docs']['researchTools']['title']);
    expect(text).toContain(help['docs']['projectAdmin']['text']);
  });

  it('translates the support cards', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain(help['support']['needMoreHelp']['title']);
    expect(text).toContain(help['support']['infrastructure']['title']);
    expect(text).toContain(help['support']['sourceCode']['title']);
  });

  it('interpolates release and environment into the development banner', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Release 1.2.3');
    expect(text).toContain('Umgebung test');
  });

  it('keeps version-bearing product titles verbatim', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('DSP-APP');
    expect(text).toContain('DSP-API');
    expect(text).toContain('Sipi');
  });

  it('renders no unresolved translation keys', () => {
    expect(fixture.nativeElement.textContent).not.toContain('pages.help.');
  });
});
