import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { CountCellComponent } from './count-cell.component';

describe('CountCellComponent', () => {
  let fixture: ComponentFixture<CountCellComponent>;

  const text = () => fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountCellComponent],
      providers: [provideTranslateService()],
    }).compileComponents();
    fixture = TestBed.createComponent(CountCellComponent);
  });

  it('renders both states of the resources unit', () => {
    fixture.componentInstance.counts = {
      resources: { hidden: 15, restrictedView: 33 },
      items: { hidden: 0, restrictedView: 0 },
    };
    fixture.detectChanges();
    expect(text()).toContain('15');
    expect(text()).toContain('33');
  });

  // The units answer different questions and the API documents that they are never summed. A resource
  // holding three hidden values is 1 resource and 3 items; reporting "4" here would make a row claim more
  // restricted resources than its class contains (the "4 of 1" case).
  it('ignores the items unit rather than adding it to the resources figure', () => {
    fixture.componentInstance.counts = {
      resources: { hidden: 1, restrictedView: 0 },
      items: { hidden: 3, restrictedView: 0 },
    };
    fixture.detectChanges();
    expect(text()).toContain('1');
    expect(text()).not.toContain('4');
    expect(text()).not.toContain('3');
  });

  // A zero state renders nothing at all, so a cell with one non-zero state shows exactly one figure.
  it('omits a state whose count is zero', () => {
    fixture.componentInstance.counts = {
      resources: { hidden: 5, restrictedView: 0 },
      items: { hidden: 0, restrictedView: 0 },
    };
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.count-hidden')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.count-restricted')).toBeNull();
  });

  it('renders a dash when no resource is restricted', () => {
    fixture.componentInstance.counts = {
      resources: { hidden: 0, restrictedView: 0 },
      items: { hidden: 0, restrictedView: 0 },
    };
    fixture.detectChanges();
    expect(text()).toBe('–');
  });

  // Only the resources unit is rendered, so a cell whose findings are all item-level shows a dash. The
  // page still reports them: `hasNoRestrictions` reads both units, and the drill-down lists the items.
  it('renders a dash when only items are restricted', () => {
    fixture.componentInstance.counts = {
      resources: { hidden: 0, restrictedView: 0 },
      items: { hidden: 4, restrictedView: 2 },
    };
    fixture.detectChanges();
    expect(text()).toBe('–');
  });

  it('renders a dash when the audience has no counts at all', () => {
    fixture.componentInstance.counts = undefined;
    fixture.detectChanges();
    expect(text()).toBe('–');
  });
});
