import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { loadTranslations } from '../i18n.spec-helper';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let de: Record<string, string>;

  beforeEach(async () => {
    const enTranslations = loadTranslations('en');
    const deTranslations = loadTranslations('de');
    de = (deTranslations['shared'] as Record<string, Record<string, string>>)['footer'];

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations);
    translate.setTranslation('de', deTranslations);
    // Assert in German: an English literal left hardcoded in the template would
    // still match the English translation, so it could not fail these tests.
    translate.use('de');

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('translates the navigation links', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain(de.legalNotice);
    expect(text).toContain(de.privacyPolicy);
    expect(text).toContain(de.contact);
  });

  it('translates the downloads section', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain(de.termsAndConditions);
    expect(text).toContain(de.depositAgreement);
    expect(text).toContain(de.statutes);
    expect(text).toContain(de.termsOfService);
  });

  it('interpolates the current year into the copyright notice', () => {
    const year = new Date().getFullYear();
    expect(fixture.nativeElement.textContent).toContain(`© ${year} DaSCH`);
  });

  it('renders no unresolved translation keys', () => {
    expect(fixture.nativeElement.textContent).not.toContain('shared.footer.');
  });
});
