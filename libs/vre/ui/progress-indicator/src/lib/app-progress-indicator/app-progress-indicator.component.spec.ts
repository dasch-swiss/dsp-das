import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppProgressIndicatorComponent } from './app-progress-indicator.component';

describe('AppProgressIndicatorComponent', () => {
  let fixture: ComponentFixture<AppProgressIndicatorComponent>;

  const strokeColour = () => fixture.nativeElement.querySelector('svg g')!.getAttribute('stroke');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppProgressIndicatorComponent] }).compileComponents();
    fixture = TestBed.createComponent(AppProgressIndicatorComponent);
  });

  it('strokes the spinner in the default colour on light surfaces', () => {
    fixture.detectChanges();

    expect(strokeColour()).toBe('#336790');
  });

  it('strokes the spinner in a light colour when placed on a dark surface', () => {
    fixture.componentInstance.onDark = true;
    fixture.detectChanges();

    expect(strokeColour()).toBe('#e8eef4');
  });

  it('sizes the spinner from the requested size', () => {
    fixture.componentInstance.size = 'medium';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg')!.getAttribute('width')).toBe('64px');
  });
});
