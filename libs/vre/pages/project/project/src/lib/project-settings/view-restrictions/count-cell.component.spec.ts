import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestrictionCounts, ValueItemType } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { provideTranslateService } from '@ngx-translate/core';
import { CountCellComponent } from './count-cell.component';

/**
 * Hosts the cell through a real template binding. The cell is `OnPush`, so assigning to the instance
 * directly never marks its view dirty — only a binding does, which is also how the page drives it when
 * the user changes the item-type chip.
 */
@Component({
  imports: [CountCellComponent],
  template: `<app-count-cell [resourceCounts]="resourceCounts" [valueCounts]="valueCounts" [itemType]="itemType" />`,
})
class HostComponent {
  resourceCounts: RestrictionCounts | undefined;
  valueCounts: RestrictionCounts | undefined;
  itemType: ValueItemType = ValueItemType.All;
}

describe('CountCellComponent', () => {
  let fixture: ComponentFixture<CountCellComponent>;

  const text = () => fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();

  /**
   * The two units arrive from two different requests since the report was made stepped (DEV-6778):
   * resources from step 1, values from step 2. They are set separately here for the same reason.
   */
  const render = (opts: {
    resourceCounts?: RestrictionCounts;
    valueCounts?: RestrictionCounts;
    itemType?: ValueItemType;
    valuesLoading?: boolean;
    valuesFailed?: boolean;
  }) => {
    const c = fixture.componentInstance;
    c.resourceCounts = opts.resourceCounts;
    c.valueCounts = opts.valueCounts;
    c.itemType = opts.itemType ?? ValueItemType.All;
    c.valuesLoading = opts.valuesLoading ?? false;
    c.valuesFailed = opts.valuesFailed ?? false;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountCellComponent],
      providers: [provideTranslateService()],
    }).compileComponents();
    fixture = TestBed.createComponent(CountCellComponent);
  });

  // The live payload that exposed the item-level rule: narrowing to Value returns findings in the value
  // unit and structurally nothing in resources, so a resources-only cell rendered a dash over a real
  // finding — blanking the matrix exactly when the user narrows to what they care about (DEV-6868).
  it('reports the value unit when the filter is item-level', () => {
    render({
      resourceCounts: { hidden: 0, restrictedView: 0 },
      valueCounts: { hidden: 1, restrictedView: 0 },
      itemType: ValueItemType.Value,
    });
    expect(text()).toContain('1');
    expect(fixture.nativeElement.querySelector('.count-hidden')).not.toBeNull();
  });

  // Resource counts are never filtered, so pairing them with a value figure narrowed to Comment would
  // put two differently-scoped numbers in one cell. Only the combined view shows both.
  it('omits the resource unit under a narrowed filter, even when it has something to report', () => {
    render({
      resourceCounts: { hidden: 15, restrictedView: 4 },
      valueCounts: { hidden: 2, restrictedView: 0 },
      itemType: ValueItemType.Comment,
    });
    expect(text()).toContain('2');
    expect(text()).not.toContain('15');
    expect(text()).not.toContain('4');
    expect(fixture.nativeElement.querySelectorAll('.count-line').length).toBe(1);
  });

  // Both units are in scope in the combined view, so both lines render — never added together.
  it('reports both units on separate lines when the filter is All', () => {
    render({
      resourceCounts: { hidden: 15, restrictedView: 0 },
      valueCounts: { hidden: 22, restrictedView: 0 },
      itemType: ValueItemType.All,
    });
    expect(fixture.nativeElement.querySelectorAll('.count-line').length).toBe(2);
    expect(text()).toContain('15');
    expect(text()).toContain('22');
    // 37 would be the summed figure: one resource holding three hidden values is 1 resource and
    // 3 values, and adding them produces rows reading "4 of 1" against a class of one resource.
    expect(text()).not.toContain('37');
  });

  // Only the combined view needs to say which unit a line counts; a single-unit cell is unambiguous.
  it('labels the units in the combined view', () => {
    render({
      resourceCounts: { hidden: 1, restrictedView: 0 },
      valueCounts: { hidden: 1, restrictedView: 0 },
      itemType: ValueItemType.All,
    });
    expect(fixture.nativeElement.querySelectorAll('.unit-icon').length).toBe(2);
  });

  it('does not label the unit when only one is in scope', () => {
    render({
      resourceCounts: { hidden: 1, restrictedView: 0 },
      valueCounts: { hidden: 1, restrictedView: 0 },
      itemType: ValueItemType.Value,
    });
    expect(fixture.nativeElement.querySelectorAll('.unit-icon').length).toBe(0);
  });

  // A zero state renders nothing, so a cell with one non-zero state shows exactly one figure.
  it('omits a state whose count is zero', () => {
    render({
      resourceCounts: { hidden: 5, restrictedView: 0 },
      valueCounts: { hidden: 0, restrictedView: 0 },
      itemType: ValueItemType.All,
    });
    expect(fixture.nativeElement.querySelector('.count-hidden')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.count-restricted')).toBeNull();
  });

  it('renders a dash when the units in scope have nothing to report', () => {
    render({
      resourceCounts: { hidden: 0, restrictedView: 0 },
      valueCounts: { hidden: 0, restrictedView: 0 },
      itemType: ValueItemType.All,
    });
    expect(text()).toBe('–');
  });

  it('renders a dash when the audience has no counts at all', () => {
    render({});
    expect(text()).toBe('–');
  });

  // ----- step 2 arriving separately (DEV-6778) -----

  // One render per test on purpose: the cell is OnPush, so a second assignment inside the same test
  // would never mark the view dirty and the assertion would silently re-read the first render.

  it('shows the pending marker while step 2 has produced nothing to render', () => {
    render({ valuesLoading: true });
    expect(text()).toBe('…');
  });

  // A row can be showing a final resources figure while its values figure is still in flight. The
  // pending marker must not replace a resources figure that is already known and never changes.
  it('keeps a known resource figure on screen while step 2 is still loading', () => {
    render({
      resourceCounts: { hidden: 3, restrictedView: 0 },
      itemType: ValueItemType.All,
      valuesLoading: true,
    });
    expect(text()).toContain('3');
    expect(text()).not.toContain('…');
  });

  it('marks a row whose step 2 failed', () => {
    render({ valuesFailed: true });
    expect(text()).toBe('?');
  });

  // Step 2 fails per row, so one class failing must mark that row and leave its resource figure — which
  // came from step 1 and cannot be partial — on screen.
  it('keeps the resource figure on a failed row, since step 1 cannot be partial', () => {
    render({
      resourceCounts: { hidden: 7, restrictedView: 0 },
      itemType: ValueItemType.All,
      valuesFailed: true,
    });
    expect(text()).toContain('7');
    expect(text()).not.toContain('?');
  });

  // Changing the chip must re-render the cells. The cell is OnPush, so this only holds if the filter
  // arrives as a binding — an earlier version took it through a setter and left stale numbers on screen.
  it('switches unit when the item-type filter changes', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({ imports: [HostComponent], providers: [provideTranslateService()] })
      .compileComponents();
    const host = TestBed.createComponent(HostComponent);
    host.componentInstance.resourceCounts = { hidden: 15, restrictedView: 0 };
    host.componentInstance.valueCounts = { hidden: 1, restrictedView: 0 };
    host.componentInstance.itemType = ValueItemType.All;
    host.detectChanges();
    const hostText = () => host.nativeElement.textContent.replace(/\s+/g, ' ').trim();
    expect(hostText()).toContain('15');

    host.componentInstance.itemType = ValueItemType.Value;
    host.detectChanges();
    expect(hostText()).toContain('1');
    expect(hostText()).not.toContain('15');
  });
});
