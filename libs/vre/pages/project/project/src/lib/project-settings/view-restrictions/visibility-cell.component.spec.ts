import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Visibility } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { provideTranslateService } from '@ngx-translate/core';
import { VisibilityCellComponent } from './visibility-cell.component';

describe('VisibilityCellComponent', () => {
  let fixture: ComponentFixture<VisibilityCellComponent>;
  let component: VisibilityCellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisibilityCellComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(VisibilityCellComponent);
    component = fixture.componentInstance;
  });

  const render = (visibility: Visibility | undefined) => {
    component.visibility = visibility;
    fixture.detectChanges();
    return fixture.debugElement.query(By.css('.col-aud'));
  };

  it('maps visibility to the correct icon', () => {
    component.visibility = Visibility.Hidden;
    expect(component.icon).toBe('visibility_off');
    component.visibility = Visibility.RestrictedView;
    expect(component.icon).toBe('blur_on');
    component.visibility = Visibility.Visible;
    expect(component.icon).toBe('visibility');
  });

  it('builds visibility translation keys from lowercase slugs, not the raw enum casing', () => {
    component.visibility = Visibility.RestrictedView;
    expect(component.label).toBe('pages.project.viewRestrictions.visibility.restrictedView');
    component.visibility = Visibility.Hidden;
    expect(component.label).toBe('pages.project.viewRestrictions.visibility.hidden');
  });

  // The hover text explains the consequence, not just the state name, and reuses the summary matrix's
  // keys so the same red glyph is not explained two different ways in one page.
  it('explains the consequence on hover, sharing the summary matrix wording', () => {
    component.visibility = Visibility.Hidden;
    expect(component.tooltip).toBe('pages.project.viewRestrictions.hiddenCount');
    component.visibility = Visibility.RestrictedView;
    expect(component.tooltip).toBe('pages.project.viewRestrictions.restrictedViewCount');
  });

  // "Visible" has no consequence worth spelling out, so it keeps its plain label.
  it('falls back to the plain label when nothing is restricted', () => {
    component.visibility = Visibility.Visible;
    expect(component.tooltip).toBe('pages.project.viewRestrictions.visibility.visible');
  });

  it('renders an icon for a restricted state', () => {
    const cell = render(Visibility.Hidden);
    expect(cell.query(By.css('mat-icon'))).not.toBeNull();
  });

  it('renders no icon when fully visible (density decision)', () => {
    const cell = render(Visibility.Visible);
    expect(cell.query(By.css('mat-icon'))).toBeNull();
  });

  it('still labels the cell when it renders no icon, so it is not an empty cell to assistive tech', () => {
    const cell = render(Visibility.Visible);
    expect(cell.attributes['role']).toBe('img');
    // the key is resolved by the translate pipe; untranslated it falls through as the key itself
    expect(cell.attributes['aria-label']).toContain('visibility.visible');
  });
});
