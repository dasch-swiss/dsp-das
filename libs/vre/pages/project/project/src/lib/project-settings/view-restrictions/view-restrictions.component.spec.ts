import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import {
  AdminAPIApiService,
  PagedResponseRestrictedResource,
  RestrictedClass,
  RestrictionCounts,
  ValueItemType,
  ViewRestrictionsClasses,
  ViewRestrictionsProperties,
  ViewRestrictionsValues,
  Visibility,
} from '@dasch-swiss/vre/3rd-party-services/open-api';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ProjectPageService } from '../../project-page.service';
import { ClassesState, ValuesState } from './view-restrictions-page.service';
import { ViewRestrictionsComponent } from './view-restrictions.component';

const THING = 'http://www.knora.org/ontology/0001/anything#Thing';
const OPEN_THING = 'http://www.knora.org/ontology/0001/anything#OpenThing';

const zero: RestrictionCounts = { hidden: 0, restrictedView: 0 };
const noCounts = { anonymous: zero, authenticated: zero, projectMember: zero };

/** Step 1: the class list with its resource-level counts and the class population. */
const classes: ViewRestrictionsClasses = {
  projectIri: 'http://rdfh.ch/projects/0001',
  classes: [
    {
      id: THING,
      label: 'Thing',
      ontology: 'anything',
      counts: {
        anonymous: { hidden: 15, restrictedView: 4 },
        authenticated: { hidden: 14, restrictedView: 2 },
        projectMember: { hidden: 5, restrictedView: 0 },
      },
      totalResources: 120,
    },
  ],
};

/** Step 2: one class's value-level counts, in a unit never added to the resource one. */
const values: ViewRestrictionsValues = {
  projectIri: 'http://rdfh.ch/projects/0001',
  resourceClass: THING,
  itemType: ValueItemType.All,
  counts: {
    anonymous: { hidden: 22, restrictedView: 0 },
    authenticated: { hidden: 3, restrictedView: 0 },
    projectMember: { hidden: 0, restrictedView: 0 },
  },
};

const properties: ViewRestrictionsProperties = { projectIri: 'http://rdfh.ch/projects/0001', properties: [] };

const itemsPage: PagedResponseRestrictedResource = {
  data: [
    {
      resourceIri: 'http://rdfh.ch/0001/a-thing',
      label: 'A thing',
      resourceClassIri: THING,
      resourceVisibility: {
        anonymous: Visibility.Hidden,
        authenticated: Visibility.Visible,
        projectMember: Visibility.Visible,
      },
      items: [],
    },
  ],
  pagination: { pageSize: 25, totalItems: 1, totalPages: 1, currentPage: 1 },
};

describe('ViewRestrictionsComponent', () => {
  let fixture: ComponentFixture<ViewRestrictionsComponent>;
  let component: ViewRestrictionsComponent;

  const adminApiMock = {
    getAdminProjectsIriProjectiriViewRestrictionsClasses: jest.fn().mockReturnValue(of(classes)),
    getAdminProjectsIriProjectiriViewRestrictionsValues: jest.fn().mockReturnValue(of(values)),
    getAdminProjectsIriProjectiriViewRestrictionsItems: jest.fn().mockReturnValue(of(itemsPage)),
    getAdminProjectsIriProjectiriViewRestrictionsProperties: jest.fn().mockReturnValue(of(properties)),
    getAdminProjectsIriProjectiriViewRestrictionsPropertyValues: jest.fn().mockReturnValue(of({})),
    getAdminProjectsIriProjectiriViewRestrictionsPropertyItems: jest.fn().mockReturnValue(of(itemsPage)),
  };

  const projectPageServiceMock = {
    currentProject$: of({ id: 'http://rdfh.ch/projects/0001', shortname: 'anything', shortcode: '0001' }),
  };

  const providers = [
    { provide: AdminAPIApiService, useValue: adminApiMock },
    { provide: ProjectPageService, useValue: projectPageServiceMock },
    // getResourcePath strips the iriBase (http://rdfh.ch) leaving /{shortcode}/{uuid}
    { provide: ResourceService, useValue: { getResourcePath: (iri: string) => iri.replace('http://rdfh.ch', '') } },
    provideTranslateService(),
    TranslateService,
  ];

  /** The step-2 state for one class, as the template hands it to the methods under test. */
  const loaded = (counts: ViewRestrictionsValues = values): ValuesState => ({ loading: false, counts });
  const clazz = (over: Partial<RestrictedClass> = {}): RestrictedClass => ({
    id: 'g',
    label: 'G',
    counts: noCounts,
    totalResources: 0,
    ...over,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRestrictionsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers,
    })
      .overrideComponent(ViewRestrictionsComponent, { set: { template: '<div>Mock Template</div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(ViewRestrictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => jest.clearAllMocks());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets the browser title for the current project', () => {
    expect(TestBed.inject(Title).getTitle()).toBe('Project anything | View restrictions');
  });

  // ----- the stepped fetch (DEV-6778) -----

  // Step 1 renders the whole table skeleton. It must resolve to a non-loading state carrying the class
  // list, having emitted the loading sentinel first — the single-request form showed nothing until
  // every class had been counted, which is what timed out.
  it('loads the class list first, after a loading sentinel', done => {
    const states: ClassesState[] = [];
    component.classesState$.subscribe(state => {
      states.push(state);
      if (!state.loading) {
        expect(state.classes?.length).toBe(1);
        expect(state.classes?.[0].totalResources).toBe(120);
        expect(states[0].loading).toBe(true);
        done();
      }
    });
  });

  // Step 2 is one request per class, so the table must be able to render before any of them answer.
  it('requests value counts per class, keyed by class IRI', done => {
    component.valuesState$.subscribe(map => {
      if (map.get(THING)?.loading === false) {
        expect(adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsValues).toHaveBeenCalledWith(
          'http://rdfh.ch/projects/0001',
          THING,
          ValueItemType.All
        );
        expect(map.get(THING)?.counts?.counts.anonymous.hidden).toBe(22);
        done();
      }
    });
  });

  // Partial data beats no data on a permissions report, provided the gaps are visible: one class failing
  // marks that row and leaves every other row intact.
  it('confines a step-2 failure to its own row', done => {
    adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsValues.mockReturnValueOnce(
      throwError(() => new Error('boom'))
    );
    component.onItemType(ValueItemType.Value);
    component.valuesState$.subscribe(map => {
      const state = map.get(THING);
      if (state && !state.loading) {
        expect(state.failed).toBe(true);
        expect(state.counts).toBeUndefined();
        done();
      }
    });
  });

  it('reports the gap so value totals can be marked a lower bound', done => {
    adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsValues.mockReturnValueOnce(
      throwError(() => new Error('boom'))
    );
    component.onItemType(ValueItemType.File);
    component.anyFailed$.subscribe(failed => {
      if (failed) {
        expect(failed).toBe(true);
        done();
      }
    });
  });

  // Step 1 failing is terminal for the page: without the class list there is no row to attribute
  // anything to, so it must resolve to a failed state rather than spin.
  it('resolves a failed class list instead of spinning forever', done => {
    adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsClasses.mockReturnValueOnce(
      throwError(() => new Error('boom'))
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ViewRestrictionsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers,
    })
      .overrideComponent(ViewRestrictionsComponent, { set: { template: '<div>Mock</div>' } })
      .compileComponents()
      .then(() => {
        const f = TestBed.createComponent(ViewRestrictionsComponent);
        f.detectChanges();
        f.componentInstance.classesState$.subscribe(state => {
          if (!state.loading) {
            expect(state.failed).toBe(true);
            expect(state.classes).toBeUndefined();
            done();
          }
        });
      });
  });

  it('reports progress as k of N for the gathering indicator', done => {
    component.progress$.subscribe(p => {
      if (p.total > 0 && p.done === p.total) {
        expect(p.total).toBe(1);
        done();
      }
    });
  });

  // ----- grouping toggle -----

  it('starts grouped by class and switches to property on request', () => {
    expect(component.grouping()).toBe('class');
    component.onGrouping('property');
    expect(component.grouping()).toBe('property');
  });

  it('collapses any expanded row when the grouping changes, so no stale panel survives', () => {
    component.toggleGroup(classes.classes[0], loaded());
    expect(component.isExpanded(THING)).toBe(true);
    component.onGrouping('property');
    expect(component.isExpanded(THING)).toBe(false);
  });

  // ----- drill-down -----

  it('expands a class and stores the fetched page', () => {
    component.toggleGroup(classes.classes[0], loaded());
    expect(adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsItems).toHaveBeenCalledWith(
      'http://rdfh.ch/projects/0001',
      THING,
      undefined,
      1,
      25
    );
    // 'of(...)' resolves synchronously, so loading must have advanced to the loaded state
    expect(component.isLoading(THING)).toBe(false);
    expect(component.isExpanded(THING)).toBe(true);
    expect(component.expandedGroup(THING)?.page.data.length).toBe(1);
  });

  it('collapses an expanded class on second toggle', () => {
    component.toggleGroup(classes.classes[0], loaded());
    component.toggleGroup(classes.classes[0], loaded());
    expect(component.isExpanded(THING)).toBe(false);
  });

  it('resets expansion and updates the filter when the item type changes', () => {
    component.toggleGroup(classes.classes[0], loaded());
    component.onItemType(ValueItemType.Value);
    expect(component.isExpanded(THING)).toBe(false);
    expect(component.itemType$.value).toBe(ValueItemType.Value);
  });

  it('marks a drill-down class as failed instead of leaving it on loading', () => {
    adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsItems.mockReturnValueOnce(
      throwError(() => new Error('boom'))
    );
    component.toggleGroup(classes.classes[0], loaded());
    expect(component.isLoading(THING)).toBe(false);
    expect(component.isFailed(THING)).toBe(true);
    expect(component.expandedGroup(THING)).toBeNull();
  });

  it('builds item-type translation keys from lowercase slugs, not the raw enum casing', () => {
    expect(component.itemTypeKey(ValueItemType.All)).toBe('pages.project.viewRestrictions.itemType.all');
    expect(component.itemTypeKey(ValueItemType.File)).toBe('pages.project.viewRestrictions.itemType.file');
    expect(component.itemTypeKey(ValueItemType.Comment)).toBe('pages.project.viewRestrictions.itemType.comment');
  });

  describe('pager adapter (app-pager is 0-based, the API is 1-based)', () => {
    it('translates a 0-based page index into the 1-based API page', () => {
      component.toggleGroup(classes.classes[0], loaded()); // loads page 1
      adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsItems.mockClear();

      component.onPageIndexChanged(THING, 2);

      expect(adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsItems).toHaveBeenCalledWith(
        'http://rdfh.ch/projects/0001',
        THING,
        undefined,
        3,
        25
      );
    });

    it('ignores an event naming the page already shown, so expanding does not refetch page 1', () => {
      component.toggleGroup(classes.classes[0], loaded()); // loads page 1 => currentPage 1
      adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsItems.mockClear();

      // app-pager resets its index to 0 when numberOfAllResults changes and emits it
      component.onPageIndexChanged(THING, 0);

      expect(adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsItems).not.toHaveBeenCalled();
      expect(component.expandedGroup(THING)?.currentPage).toBe(1);
    });

    // The pager holds its page index internally with no input for it, so unmounting it resets the view
    // to page 1 while the data is page 2. Paging therefore keeps the current page rendered and only
    // flags it loading — a regression here is invisible except through the mounted/unmounted pager.
    it('keeps the current page mounted while the next one loads', () => {
      component.toggleGroup(classes.classes[0], loaded());
      let resolve: ((v: PagedResponseRestrictedResource) => void) | undefined;
      adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsItems.mockReturnValueOnce(
        new (require('rxjs').Observable)((sub: { next: (v: unknown) => void }) => {
          resolve = v => sub.next(v);
        })
      );

      component.onPageIndexChanged(THING, 1);

      // still page 1's data on screen, flagged as loading rather than replaced by a spinner state
      expect(component.expandedGroup(THING)).not.toBeNull();
      expect(component.expandedGroup(THING)?.currentPage).toBe(1);
      expect(component.isPageLoading(THING)).toBe(true);
      expect(component.isLoading(THING)).toBe(false);
      expect(resolve).toBeDefined();
    });
  });

  describe('links', () => {
    it('resourceLink builds /resource/{shortcode}/{uuid} from the resource IRI', () => {
      expect(component.resourceLink('http://rdfh.ch/0001/a-thing')).toBe('/resource/0001/a-thing');
    });

    it('itemLink deep-links to the value via highlightValue (value UUID = last IRI segment)', () => {
      expect(component.itemLink('http://rdfh.ch/0001/a-thing', 'http://rdfh.ch/0001/a-thing/values/xyz')).toBe(
        '/resource/0001/a-thing?highlightValue=xyz'
      );
    });

    it('itemLink falls back to the resource link when there is no value IRI', () => {
      expect(component.itemLink('http://rdfh.ch/0001/a-thing', undefined)).toBe('/resource/0001/a-thing');
    });
  });

  describe('footer totals (the two units are summed separately)', () => {
    it('sums an audience resource counts over the classes on screen', () => {
      expect(component.totalCounts(classes.classes, 'anonymous')).toEqual({ hidden: 15, restrictedView: 4 });
    });

    // A lower bound whenever a class failed: classes without counts contribute nothing rather than
    // being guessed at, which is why the banner above the table has to say so.
    it('sums only the value counts that arrived, treating a failed class as absent not zero-known', () => {
      const map = new Map<string, ValuesState>([
        [THING, loaded()],
        [OPEN_THING, { loading: false, failed: true }],
      ]);
      expect(component.totalValueCounts(map, 'anonymous')).toEqual({ hidden: 22, restrictedView: 0 });
    });

    it('sums the class population from totalResources alone, never from the counts', () => {
      expect(component.totalResources(classes.classes)).toBe(120);
      expect(component.totalResources(undefined)).toBe(0);
    });

    // The population is independent of the restrictions: an unrestricted class still counts.
    it('counts an unrestricted class towards the population total', () => {
      expect(component.totalResources([...classes.classes, clazz({ id: OPEN_THING, totalResources: 500 })])).toBe(620);
    });
  });

  describe('isEmptyCount', () => {
    it('is empty only when both states are zero', () => {
      expect(component.isEmptyCount(zero)).toBe(true);
      expect(component.isEmptyCount(undefined)).toBe(true);
    });

    // Restricted-view-only must still count as a finding — folding it into "no restrictions" is exactly
    // the conflation screen 1i exists to undo.
    it('is not empty when only restricted view is non-zero', () => {
      expect(component.isEmptyCount({ hidden: 0, restrictedView: 3 })).toBe(false);
    });

    it('is not empty when only hidden is non-zero', () => {
      expect(component.isEmptyCount({ hidden: 2, restrictedView: 0 })).toBe(false);
    });
  });

  // In class mode the API lists every class, so most rows on a healthy project have nothing beneath
  // them. Those used to expand onto an empty list, which read as a panel opening and shutting by itself.
  describe('isExpandable (rows with nothing to drill into do not open)', () => {
    it('is false when neither unit has anything to report', () => {
      expect(component.isExpandable(clazz(), loaded({ ...values, counts: noCounts }))).toBe(false);
    });

    it('is true when any single audience has a resource finding', () => {
      expect(
        component.isExpandable(
          clazz({ counts: { ...noCounts, projectMember: { hidden: 1, restrictedView: 0 } } }),
          loaded({ ...values, counts: noCounts })
        )
      ).toBe(true);
    });

    // Restricted-view-only is still a finding — folding it in would make a row with real content inert.
    it('is true when an audience has only restricted-view counts', () => {
      expect(
        component.isExpandable(
          clazz({ counts: { ...noCounts, anonymous: { hidden: 0, restrictedView: 2 } } }),
          loaded({ ...values, counts: noCounts })
        )
      ).toBe(true);
    });

    // The drill-down reports value-level findings too, so a row whose only content is inside its
    // resources must still open — judging by the resource unit alone would hide it.
    it('is true when the findings are value-level only', () => {
      expect(component.isExpandable(clazz(), loaded())).toBe(true);
    });

    // Judging a row inert on incomplete data would make rows stop being clickable as their counts
    // arrive, which reads as the UI fighting the user.
    it('is true while step 2 is still in flight, whatever the resource counts say', () => {
      expect(component.isExpandable(clazz(), { loading: true })).toBe(true);
    });

    // The template disables the row, but a click already in flight when the filter changed must not
    // open a row that is now empty — hence the guard on the handler itself.
    it('refuses to expand an empty row even when toggled directly', () => {
      component.toggleGroup(clazz(), loaded({ ...values, counts: noCounts }));
      expect(component.isExpanded('g')).toBe(false);
      expect(adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsItems).not.toHaveBeenCalled();
    });
  });

  describe('hasNoRestrictions', () => {
    const answered = (counts: ViewRestrictionsValues['counts']) =>
      new Map<string, ValuesState>([[THING, loaded({ ...values, counts })]]);

    it('is true when every class is clean in both units', () => {
      expect(component.hasNoRestrictions([clazz()], answered(noCounts))).toBe(true);
    });

    it('is false when a resource count is non-zero', () => {
      expect(component.hasNoRestrictions(classes.classes, answered(noCounts))).toBe(false);
    });

    it('is false when only the value unit has findings', () => {
      expect(component.hasNoRestrictions([clazz()], answered(values.counts))).toBe(false);
    });

    // Saying "nothing restricted" while step 2 is still running would be a statement the data does not
    // yet support — the report would announce a clean project and then contradict itself.
    it('is false while any class is still being counted', () => {
      const pending = new Map<string, ValuesState>([[THING, { loading: true }]]);
      expect(component.hasNoRestrictions([clazz()], pending)).toBe(false);
    });
  });

  describe('isCombo (single-item resources render on one line)', () => {
    const visible = {
      anonymous: Visibility.Visible,
      authenticated: Visibility.Visible,
      projectMember: Visibility.Visible,
    };
    const item = {
      type: ValueItemType.Value,
      visibility: { anonymous: Visibility.Hidden, authenticated: Visibility.Hidden, projectMember: Visibility.Visible },
    };
    const res = (over: Record<string, unknown>) =>
      ({
        resourceIri: 'r',
        label: 'R',
        resourceClassIri: 'c',
        resourceVisibility: visible,
        items: [],
        ...over,
      }) as never;

    it('is a combo when the resource is fully visible and has exactly one item', () => {
      expect(component.isCombo(res({ items: [item] }))).toBe(true);
    });

    it('is NOT a combo when the resource has more than one item', () => {
      expect(component.isCombo(res({ items: [item, item] }))).toBe(false);
    });

    it('is NOT a combo when the resource itself is restricted', () => {
      expect(
        component.isCombo(res({ items: [item], resourceVisibility: { ...visible, anonymous: Visibility.Hidden } }))
      ).toBe(false);
    });

    it('is NOT a combo when the resource has no items (whole-resource restriction)', () => {
      expect(component.isCombo(res({ items: [] }))).toBe(false);
    });
  });

  // Red and amber are otherwise the only thing separating the two states. The legend is where that is
  // explained, so it has to survive template edits — without it the matrix is a wall of undecodable
  // colour. Needs the real template, which the suite's shared TestBed replaces with a mock.
  describe('state legend', () => {
    let el: HTMLElement;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ViewRestrictionsComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers,
      }).compileComponents();

      const f = TestBed.createComponent(ViewRestrictionsComponent);
      f.detectChanges();
      el = f.nativeElement as HTMLElement;
    });

    it('explains both states once, below the matrix', () => {
      const entries = Array.from(el.querySelectorAll('.legend .legend-entry')).map(e => e.textContent?.trim());
      expect(entries.length).toBe(2);
      expect(entries[0]).toContain('pages.project.viewRestrictions.hiddenCount');
      expect(entries[1]).toContain('pages.project.viewRestrictions.restrictedViewCount');
    });

    // A legend keyed on different glyphs than the table explains nothing. These are the icons the count
    // cells and the drill-down cells render.
    it('keys on the glyphs the cells actually use', () => {
      expect(el.querySelector('.legend .legend-hidden')?.textContent?.trim()).toBe('visibility_off');
      expect(el.querySelector('.legend .legend-restricted')?.textContent?.trim()).toBe('blur_on');
    });
  });
});
