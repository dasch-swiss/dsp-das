import { provideRouter } from '@angular/router';
import {
  AdminAPIApiService,
  ItemType,
  PagedResponseRestrictedResource,
  RestrictedClass,
  RestrictedItem,
  RestrictedResource,
  RestrictionCounts,
  ValueItemType,
  ViewRestrictionsClasses,
  ViewRestrictionsValues,
  Visibility,
} from '@dasch-swiss/vre/3rd-party-services/open-api';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { NEVER, of, throwError } from 'rxjs';
import { expect, userEvent, within } from 'storybook/test';

import { ProjectPageService } from '../../project-page.service';
import { ViewRestrictionsComponent } from './view-restrictions.component';

// ---------------------------------------------------------------------------
// Fixtures
//
// The report loads in two steps (DEV-6778): step 1 returns the class list with its resource-level
// counts and populations, step 2 returns one class's value-level counts. The fixtures mirror that
// split — the two units are never combined here for the same reason the UI never adds them.
// ---------------------------------------------------------------------------

const THING = 'http://www.knora.org/ontology/0001/anything#Thing';
const BLUE_THING = 'http://www.knora.org/ontology/0001/anything#BlueThing';
const OPEN_THING = 'http://www.knora.org/ontology/0001/anything#OpenThing';

const ALL_VISIBLE = {
  anonymous: Visibility.Visible,
  authenticated: Visibility.Visible,
  projectMember: Visibility.Visible,
};

const HIDDEN_FROM_PUBLIC = {
  anonymous: Visibility.Hidden,
  authenticated: Visibility.Visible,
  projectMember: Visibility.Visible,
};

const NONE: RestrictionCounts = { hidden: 0, restrictedView: 0 };
const NO_COUNTS = { anonymous: NONE, authenticated: NONE, projectMember: NONE };

const makeClass = (over: Partial<RestrictedClass> = {}): RestrictedClass => ({
  id: THING,
  label: 'Thing',
  ontology: 'anything',
  counts: {
    anonymous: { hidden: 37, restrictedView: 11 },
    authenticated: { hidden: 23, restrictedView: 5 },
    projectMember: { hidden: 5, restrictedView: 0 },
  },
  totalResources: 120,
  ...over,
});

const makeClasses = (classes?: RestrictedClass[]): ViewRestrictionsClasses => ({
  projectIri: 'http://rdfh.ch/projects/0001',
  classes: classes ?? [
    makeClass(),
    // restricted for one audience only — the case a single conflated count would hide
    makeClass({
      id: BLUE_THING,
      label: 'Blue thing',
      counts: { ...NO_COUNTS, anonymous: { hidden: 3, restrictedView: 0 } },
      totalResources: 30,
    }),
  ],
});

const makeValues = (
  counts: ViewRestrictionsValues['counts'] = NO_COUNTS,
  over: Partial<ViewRestrictionsValues> = {}
): ViewRestrictionsValues => ({
  projectIri: 'http://rdfh.ch/projects/0001',
  resourceClass: THING,
  itemType: ValueItemType.All,
  counts,
  ...over,
});

const makeItem = (overrides: Partial<RestrictedItem> = {}): RestrictedItem => ({
  type: ItemType.Value,
  propertyLabel: 'Has description',
  valueIri: 'http://rdfh.ch/0001/a-thing/values/abc123',
  visibility: HIDDEN_FROM_PUBLIC,
  ...overrides,
});

const makeResource = (overrides: Partial<RestrictedResource> = {}): RestrictedResource => ({
  resourceIri: 'http://rdfh.ch/0001/a-thing',
  label: 'A thing',
  resourceClassIri: THING,
  resourceVisibility: ALL_VISIBLE,
  items: [makeItem()],
  ...overrides,
});

const makeItemsPage = (
  data: RestrictedResource[],
  pagination: Partial<PagedResponseRestrictedResource['pagination']> = {}
): PagedResponseRestrictedResource => ({
  data,
  pagination: { pageSize: 25, totalItems: data.length, totalPages: 1, currentPage: 1, ...pagination },
});

/**
 * `ProjectPageService.currentProject$` is the only thing the page needs from the project context.
 * `ResourceService.getResourcePath` strips the iriBase, so the stub mirrors the real behaviour.
 */
const sharedProviders = [
  provideRouter([]),
  {
    provide: ProjectPageService,
    useValue: {
      currentProject$: of({ id: 'http://rdfh.ch/projects/0001', shortname: 'anything', shortcode: '0001' }),
    },
  },
  {
    provide: ResourceService,
    useValue: { getResourcePath: (iri: string) => iri.replace('http://rdfh.ch', '') },
  },
];

/**
 * Three endpoints rather than one, because the page issues three kinds of request: the class list once,
 * the value counts once per class, and the drill-down on expand. `values` is a function of the class IRI
 * so a story can make one class fail or answer differently from the rest — which is the whole point of
 * per-class step 2.
 *
 * The property-grouped endpoints are stubbed too: the component provides that page service, so a story
 * that flips the grouping toggle would otherwise hit an undefined method.
 */
const withApi = (
  classes: unknown,
  values: unknown | ((classIri: string) => unknown),
  items: unknown,
  properties: unknown = of({ projectIri: 'http://rdfh.ch/projects/0001', properties: [] })
) =>
  applicationConfig({
    providers: [
      ...sharedProviders,
      {
        provide: AdminAPIApiService,
        useValue: {
          getAdminProjectsIriProjectiriViewRestrictionsClasses: () => classes,
          getAdminProjectsIriProjectiriViewRestrictionsValues: (_iri: string, classIri: string) =>
            typeof values === 'function' ? (values as (c: string) => unknown)(classIri) : values,
          getAdminProjectsIriProjectiriViewRestrictionsItems: () => items,
          getAdminProjectsIriProjectiriViewRestrictionsProperties: () => properties,
          getAdminProjectsIriProjectiriViewRestrictionsPropertyValues: () =>
            of({ ...makeValues(), property: THING, totalValues: 900 }),
          getAdminProjectsIriProjectiriViewRestrictionsPropertyItems: () => of(makeItemsPage([])),
        },
      },
    ],
  });

/** The common case: step 2 answers for every class with nothing at the value level. */
const noValueFindings = of(makeValues());

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<ViewRestrictionsComponent> = {
  title: 'Project Settings / View Restrictions',
  component: ViewRestrictionsComponent,
  argTypes: {
    expanded: {
      description:
        'Per-class drill-down state keyed by class id. Each entry is either the loaded page, ' +
        "'loading' while it is being fetched, or 'failed' if the fetch errored.",
      table: { category: 'State', type: { summary: "Signal<Record<string, ExpandedGroup | 'loading' | 'failed'>>" } },
    },
    grouping: {
      description: 'Which report is on screen: the class-grouped one or its property-grouped sibling.',
      table: { category: 'State', type: { summary: "Signal<'class' | 'property'>" } },
    },
    pageSize: {
      description: 'Drill-down page size; also passed to app-pager so it can compute the page count.',
      table: { category: 'Inputs', type: { summary: 'number' }, defaultValue: { summary: '25' } },
    },
    itemTypeChips: {
      description: 'The item-type filter chips, in display order.',
      table: { category: 'Inputs', type: { summary: 'ValueItemType[]' } },
    },
  },
};
export default meta;
type Story = StoryObj<ViewRestrictionsComponent>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const ShowsMatrixWithPerAudienceCounts: Story = {
  name: 'Shows the per-audience matrix with a totals row',
  decorators: [withApi(of(makeClasses()), noValueFindings, of(makeItemsPage([makeResource()])))],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Both resource classes are listed', async () => {
      await expect(canvas.getByText('Thing')).toBeInTheDocument();
      await expect(canvas.getByText('Blue thing')).toBeInTheDocument();
    });
    await step('The totals row sums the hidden counts across classes', async () => {
      // 37 (Thing) + 3 (Blue thing) hidden resources for the anonymous audience
      await expect(canvas.getByText('40')).toBeInTheDocument();
    });
  },
};

export const ShowsDashForAudiencesWithNoRestrictions: Story = {
  name: 'Shows a dash instead of zero when an audience has no restrictions',
  decorators: [withApi(of(makeClasses()), noValueFindings, of(makeItemsPage([makeResource()])))],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Zero counts render as an en dash rather than "0"', async () => {
      // "Blue thing" is hidden from anonymous only, so two of its cells are zero
      await expect(canvas.getAllByText('–').length).toBeGreaterThan(0);
    });
  },
};

// Step 1 is a page-level wait: without the class list there is no table to render at all.
export const ShowsSpinnerWhileFetchingClasses: Story = {
  name: 'Shows a progress indicator while the class list is loading',
  decorators: [withApi(NEVER, NEVER, NEVER)],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Progress indicator is rendered, and names the step', async () => {
      await expect(canvasElement.querySelector('app-progress-indicator')).not.toBeNull();
      await expect(canvas.getByText(/Fetching resource classes/i)).toBeInTheDocument();
    });
  },
};

/**
 * The point of the split: the table renders from step 1 and the value cells fill in behind it. The
 * single-request form showed nothing at all until every class had been counted, which is what exceeded
 * the triplestore timeout and produced a 500 on large projects.
 */
export const ShowsTableWhileValueCountsAreStillArriving: Story = {
  name: 'Renders the table from step 1 while step 2 is still gathering',
  decorators: [withApi(of(makeClasses()), NEVER, of(makeItemsPage([makeResource()])))],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The class rows are already on screen', async () => {
      await expect(canvas.getByText('Thing')).toBeInTheDocument();
      await expect(canvas.getByText('Blue thing')).toBeInTheDocument();
    });
    await step('Progress reports how many classes have answered so far', async () => {
      await expect(canvas.getByText(/Gathering restrictions 0 \/ 2/i)).toBeInTheDocument();
    });
    await step('Resource counts from step 1 are final and shown, not withheld', async () => {
      await expect(canvas.getByText('37')).toBeInTheDocument();
    });
  },
};

export const ShowsErrorWhenClassListFails: Story = {
  name: 'Shows an error instead of spinning forever when the class list fails',
  decorators: [
    withApi(
      throwError(() => new Error('boom')),
      NEVER,
      NEVER
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The failure message replaces the spinner', async () => {
      await expect(canvas.getByText(/resource classes could not be loaded/i)).toBeInTheDocument();
      await expect(canvasElement.querySelector('app-progress-indicator')).toBeNull();
    });
  },
};

/**
 * A step-2 failure is confined to its row. Partial data beats no data on a permissions report, provided
 * the gaps are visible — hence the row marker, the retry, and the banner saying the value totals are a
 * lower bound.
 */
export const ConfinesAFailedClassToItsOwnRow: Story = {
  name: 'Marks the one class whose counts failed and keeps the rest of the table',
  decorators: [
    withApi(
      of(makeClasses()),
      (classIri: string) => (classIri === BLUE_THING ? throwError(() => new Error('boom')) : noValueFindings),
      of(makeItemsPage([makeResource()]))
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rowFor = (label: string) =>
      Array.from(canvasElement.querySelectorAll<HTMLButtonElement>('.matrix-row')).find(r =>
        r.textContent?.includes(label)
      )!;

    await step('Only the failing row is marked', async () => {
      await expect(rowFor('Blue thing').querySelector('.row-error')).not.toBeNull();
      await expect(rowFor('Thing').querySelector('.row-error')).toBeNull();
    });
    await step('That row offers a retry rather than requiring a page reload', async () => {
      await expect(rowFor('Blue thing').querySelector('.row-retry')).not.toBeNull();
    });
    await step('The value totals are flagged as a lower bound', async () => {
      await expect(canvas.getByText(/totals below are a lower bound/i)).toBeInTheDocument();
    });
    await step('Every other row keeps its data', async () => {
      await expect(canvas.getByText('37')).toBeInTheDocument();
    });
  },
};

export const ShowsResourcePopulationPerClass: Story = {
  name: 'Shows each class’s resource population next to its restriction counts',
  decorators: [withApi(of(makeClasses()), noValueFindings, of(makeItemsPage([makeResource()])))],
  play: async ({ canvasElement, step }) => {
    await step('The Resources column header is present', async () => {
      await expect(canvasElement.querySelector('.matrix-head .col-total')?.textContent).toContain('Resources');
    });
    await step('Each class reports its own population', async () => {
      const populations = Array.from(canvasElement.querySelectorAll('.matrix-row .col-total')).map(e =>
        e.textContent?.trim()
      );
      await expect(populations).toContain('120');
      await expect(populations).toContain('30');
    });
    await step('The footer sums the populations of the listed classes', async () => {
      await expect(canvasElement.querySelector('.matrix-foot .col-total')?.textContent?.trim()).toBe('150');
    });
  },
};

/**
 * Every class is listed, restricted or not. The population is a denominator, not a restriction count, so
 * an untouched class still contributes its resources to the footer.
 */
export const ShowsUnrestrictedClassWithItsPopulation: Story = {
  name: 'Lists a class with no restrictions, with its resource count intact',
  decorators: [
    withApi(
      of(
        makeClasses([
          makeClass(),
          makeClass({ id: OPEN_THING, label: 'Open thing', counts: NO_COUNTS, totalResources: 500 }),
        ])
      ),
      noValueFindings,
      of(makeItemsPage([makeResource()]))
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The unrestricted class is listed with its population', async () => {
      await expect(canvas.getByText('Open thing')).toBeInTheDocument();
      await expect(canvas.getByText('500')).toBeInTheDocument();
    });
    await step('It counts towards the footer total', async () => {
      await expect(canvasElement.querySelector('.matrix-foot .col-total')?.textContent?.trim()).toBe('620');
    });
  },
};

/**
 * Class mode lists every class, so the rows-are-empty branch never fires on a project with any resources
 * at all. Without saying so explicitly the page would render a table of dashes with no explanation.
 */
export const ShowsNoteWhenNothingIsRestricted: Story = {
  name: 'States that nothing is restricted rather than showing a table of dashes',
  decorators: [withApi(of(makeClasses([makeClass({ counts: NO_COUNTS })])), noValueFindings, of(makeItemsPage([])))],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The "no restrictions" note is shown', async () => {
      await expect(canvas.getByText(/No restrictions found/i)).toBeInTheDocument();
    });
    await step('The class is still listed with its population', async () => {
      await expect(canvas.getByText('Thing')).toBeInTheDocument();
      // Scoped to the row: with a single class the same figure is also the footer total, so an
      // unscoped getByText matches twice and throws rather than asserting anything.
      await expect(canvasElement.querySelector('.matrix-row .col-total')?.textContent?.trim()).toBe('120');
    });
  },
};

export const ShowsHiddenAndRestrictedViewSeparately: Story = {
  name: 'Splits each count into hidden and restricted view',
  decorators: [withApi(of(makeClasses()), noValueFindings, of(makeItemsPage([makeResource()])))],
  play: async ({ canvasElement, step }) => {
    await step('Both states render as their own figure, never summed', async () => {
      await expect(canvasElement.querySelector('.count-hidden')).not.toBeNull();
      await expect(canvasElement.querySelector('.count-restricted')).not.toBeNull();
    });
    await step('48 — the summed figure — appears nowhere', async () => {
      // 37 hidden + 11 restricted view for the anonymous audience on "Thing"
      await expect(within(canvasElement).queryByText('48')).toBeNull();
    });
  },
};

/**
 * Four of the five filters are value-level. Under `Value`, `File` or `Comment` the resources unit is
 * structurally zero, so a resources-only cell would blank the entire matrix exactly when the user
 * narrows to what they care about (DEV-6868).
 */
export const ReportsValueLevelFindingsUnderAValueFilter: Story = {
  name: 'Reports value-level findings when the item-type filter is value-level',
  decorators: [
    withApi(
      of(
        makeClasses([
          makeClass({ id: THING, label: 't', ontology: 'incunabula', counts: NO_COUNTS, totalResources: 1 }),
        ])
      ),
      of(makeValues({ ...NO_COUNTS, anonymous: { hidden: 1, restrictedView: 0 } })),
      of(makeItemsPage([makeResource()]))
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Narrow the filter to values, as the user would', async () => {
      // the page starts on "All items"; the cells follow whichever chip is selected.
      await userEvent.click(canvas.getByText('Values'));
    });
    await step('The hidden value is reported rather than swallowed', async () => {
      await expect(canvas.getByText('t')).toBeInTheDocument();
      await expect(canvasElement.querySelector('.count-hidden')).not.toBeNull();
    });
    await step('The report is not announced as having no restrictions', async () => {
      await expect(canvasElement.querySelector('.empty-note')).toBeNull();
    });
  },
};

/**
 * ONE resource in the class, itself fully visible, carrying THREE hidden values. Summing the units would
 * render "4" against a population of 1 — the figure the API documents as meaningless.
 */
export const ShowsManyRestrictedValuesOnOneResource: Story = {
  name: 'Never claims more restricted resources than the class has (the "3 of 1" case)',
  decorators: [
    withApi(
      of(makeClasses([makeClass({ id: THING, label: 'Sparse thing', counts: NO_COUNTS, totalResources: 1 })])),
      of(
        makeValues({
          anonymous: { hidden: 3, restrictedView: 0 },
          authenticated: { hidden: 3, restrictedView: 0 },
          projectMember: NONE,
        })
      ),
      of(makeItemsPage([makeResource()]))
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The population column shows the true population, not the restriction count', async () => {
      await expect(canvas.getByText('Sparse thing')).toBeInTheDocument();
      await expect(canvas.getAllByText('1').length).toBeGreaterThan(0);
    });
    await step('The three restrictions are reported as values, in their own line', async () => {
      // the same figure appears in the class row and the totals row, so match all of them
      await expect(canvas.getAllByText('3').length).toBeGreaterThan(0);
      await expect(canvasElement.querySelectorAll('.count-line').length).toBeGreaterThan(0);
    });
    await step('No row claims more restricted resources than the class contains', async () => {
      // "4" is resources + values summed
      await expect(canvas.queryByText('4')).toBeNull();
    });
    await step('The row is still reported rather than announced as unrestricted', async () => {
      await expect(canvasElement.querySelector('.empty-note')).toBeNull();
    });
  },
};

/**
 * In class mode the API lists every class, restricted or not, so most rows on a healthy project have
 * nothing beneath them. Clicking one used to expand it onto an empty list — the chevron turned, no
 * content appeared, and it read as a panel that opened and shut by itself.
 */
export const DoesNotOpenAClassWithNothingToShow: Story = {
  name: 'Makes a class with nothing restricted inert instead of opening it onto an empty list',
  decorators: [
    withApi(
      of(
        makeClasses([
          makeClass(),
          makeClass({ id: OPEN_THING, label: 'Open thing', counts: NO_COUNTS, totalResources: 500 }),
        ])
      ),
      noValueFindings,
      of(makeItemsPage([makeResource()]))
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rowFor = (label: string) =>
      Array.from(canvasElement.querySelectorAll<HTMLButtonElement>('.matrix-row')).find(r =>
        r.textContent?.includes(label)
      )!;

    await step('The unrestricted class is still listed, with its population', async () => {
      await expect(canvas.getByText('Open thing')).toBeInTheDocument();
      await expect(canvas.getByText('500')).toBeInTheDocument();
    });
    await step('It offers no chevron, so it does not present itself as openable', async () => {
      await expect(rowFor('Open thing').querySelector('.chevron')).toBeNull();
      await expect(rowFor('Thing').querySelector('.chevron')).not.toBeNull();
    });
    await step('Clicking it does nothing — no drill-down appears', async () => {
      await userEvent.click(canvas.getByText('Open thing'), { pointerEventsCheck: 0 });
      await expect(canvas.queryByText('A thing')).not.toBeInTheDocument();
    });
    await step('A class that does have findings still opens', async () => {
      await userEvent.click(canvas.getByText('Thing'));
      await expect(canvas.getByText('A thing')).toBeInTheDocument();
    });
  },
};

/**
 * Colour is the only thing separating hidden from restricted view at a glance. Explained once in a
 * legend rather than per figure — a matrix carries dozens of them, and the same two glyphs mark the
 * drill-down rows, so one key serves the whole page.
 */
export const ExplainsTheStateIconsInALegend: Story = {
  name: 'Explains the two state icons in a legend under the matrix',
  decorators: [withApi(of(makeClasses()), noValueFindings, of(makeItemsPage([makeResource()])))],
  play: async ({ canvasElement, step }) => {
    await step('Both states are explained, once each', async () => {
      const entries = Array.from(canvasElement.querySelectorAll('.legend .legend-entry')).map(e =>
        e.textContent?.trim()
      );
      await expect(entries.length).toBe(2);
      await expect(entries[0]).toContain('Hidden');
      await expect(entries[1]).toContain('Restricted view');
    });
    await step('The legend keys on the glyphs the cells actually use', async () => {
      await expect(canvasElement.querySelector('.legend .legend-hidden')?.textContent?.trim()).toBe('visibility_off');
      await expect(canvasElement.querySelector('.legend .legend-restricted')?.textContent?.trim()).toBe('blur_on');
    });
  },
};

export const ExpandsGroupToRevealAffectedResources: Story = {
  name: 'Reveals the affected resources when a class row is clicked',
  decorators: [
    withApi(
      of(makeClasses()),
      noValueFindings,
      of(
        makeItemsPage([
          makeResource({
            resourceVisibility: HIDDEN_FROM_PUBLIC,
            items: [makeItem({ propertyLabel: 'Has description' }), makeItem({ propertyLabel: 'Has comment' })],
          }),
        ])
      )
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The drill-down is collapsed initially', async () => {
      await expect(canvas.queryByText('A thing')).not.toBeInTheDocument();
    });
    await step('User clicks the class row', async () => {
      await userEvent.click(canvas.getByText('Thing'));
    });
    await step('The affected resource and its restricted items appear', async () => {
      await expect(canvas.getByText('A thing')).toBeInTheDocument();
      await expect(canvas.getByText('Has description')).toBeInTheDocument();
      await expect(canvas.getByText('Has comment')).toBeInTheDocument();
    });
  },
};

export const CollapsesGroupOnSecondClick: Story = {
  name: 'Collapses the drill-down when the class row is clicked again',
  decorators: [
    withApi(
      of(makeClasses()),
      noValueFindings,
      of(makeItemsPage([makeResource({ resourceVisibility: HIDDEN_FROM_PUBLIC })]))
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('User expands then collapses the class', async () => {
      await userEvent.click(canvas.getByText('Thing'));
      await expect(canvas.getByText('A thing')).toBeInTheDocument();
      await userEvent.click(canvas.getByText('Thing'));
    });
    await step('The affected resource is hidden again', async () => {
      await expect(canvas.queryByText('A thing')).not.toBeInTheDocument();
    });
  },
};

export const ShowsErrorWhenDrillDownFails: Story = {
  name: 'Shows an error in the expanded row when the drill-down fails',
  decorators: [
    withApi(
      of(makeClasses()),
      noValueFindings,
      throwError(() => new Error('boom'))
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('User expands a class whose items fail to load', async () => {
      await userEvent.click(canvas.getByText('Thing'));
    });
    await step('The row shows a failure message rather than a stuck spinner', async () => {
      await expect(canvas.getByText(/affected resources could not be loaded/i)).toBeInTheDocument();
      await expect(canvasElement.querySelector('app-progress-indicator')).toBeNull();
    });
  },
};

export const RendersSingleItemResourceAsOneComboRow: Story = {
  name: 'Collapses a fully-visible resource with one restricted item onto a single row',
  decorators: [
    withApi(
      of(makeClasses()),
      noValueFindings,
      // resource itself fully visible + exactly one item => combo row
      of(makeItemsPage([makeResource({ resourceVisibility: ALL_VISIBLE, items: [makeItem()] })]))
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('User expands the class', async () => {
      await userEvent.click(canvas.getByText('Thing'));
    });
    await step('The resource and its single item share one row', async () => {
      const comboRow = canvasElement.querySelector('.col-group.combo');
      await expect(comboRow).not.toBeNull();
      await expect(comboRow!.textContent).toContain('A thing');
      await expect(comboRow!.textContent).toContain('Has description');
    });
  },
};

export const FallsBackToTranslatedTypeWhenItemHasNoLabel: Story = {
  name: 'Uses the translated item type as the label when a property label is missing',
  decorators: [
    withApi(
      of(makeClasses()),
      noValueFindings,
      of(
        makeItemsPage([
          makeResource({
            resourceVisibility: HIDDEN_FROM_PUBLIC,
            // propertyLabel is optional in the API — a file value typically has none
            items: [makeItem({ type: ItemType.File, propertyLabel: undefined, valueIri: undefined })],
          }),
        ])
      )
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('User expands the class', async () => {
      await userEvent.click(canvas.getByText('Thing'));
    });
    await step('The label reads the translated type, never the raw "File" enum value', async () => {
      // en.json maps itemType.file to "File values"
      await expect(canvas.getAllByText('File values').length).toBeGreaterThan(0);
    });
  },
};

export const LabelsVisibilityForAssistiveTechWhenNoIconIsShown: Story = {
  name: 'Labels a fully-visible cell even though it renders no icon',
  decorators: [
    withApi(
      of(makeClasses()),
      noValueFindings,
      of(makeItemsPage([makeResource({ resourceVisibility: HIDDEN_FROM_PUBLIC, items: [] })]))
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('User expands the class', async () => {
      await userEvent.click(canvas.getByText('Thing'));
    });
    await step('Visible cells carry an accessible name despite showing no glyph', async () => {
      // the resource is hidden from anonymous only, so the other two cells are "Visible"
      const visibleCells = canvas.getAllByLabelText('Visible');
      await expect(visibleCells.length).toBeGreaterThan(0);
      await expect(visibleCells[0].querySelector('mat-icon')).toBeNull();
    });
    await step('The hidden cell is both labelled and shows an icon', async () => {
      const hiddenCell = canvas.getAllByLabelText('Hidden')[0];
      await expect(hiddenCell.querySelector('mat-icon')).not.toBeNull();
    });
  },
};

export const PagesThroughAffectedResources: Story = {
  name: 'Fetches the next page when the pager advances',
  decorators: [
    applicationConfig({
      providers: [
        ...sharedProviders,
        {
          provide: AdminAPIApiService,
          useValue: {
            getAdminProjectsIriProjectiriViewRestrictionsClasses: () => of(makeClasses()),
            getAdminProjectsIriProjectiriViewRestrictionsValues: () => noValueFindings,
            getAdminProjectsIriProjectiriViewRestrictionsProperties: () =>
              of({ projectIri: 'http://rdfh.ch/projects/0001', properties: [] }),
            getAdminProjectsIriProjectiriViewRestrictionsPropertyValues: () =>
              of({ ...makeValues(), property: THING, totalValues: 900 }),
            getAdminProjectsIriProjectiriViewRestrictionsPropertyItems: () => of(makeItemsPage([])),
            // echo the requested page into the label so the story can assert which page is shown.
            // `groupBy` was dropped from /items with property mode, so page is the 4th argument now.
            getAdminProjectsIriProjectiriViewRestrictionsItems: (
              _iri: string,
              _resourceClass: string,
              _itemType: ValueItemType,
              page = 1
            ) =>
              of(
                makeItemsPage(
                  [
                    makeResource({
                      resourceIri: `http://rdfh.ch/0001/thing-p${page}`,
                      label: `Thing on page ${page}`,
                      resourceVisibility: HIDDEN_FROM_PUBLIC,
                      items: [],
                    }),
                  ],
                  { totalItems: 60, totalPages: 3, currentPage: page }
                )
              ),
          },
        },
      ],
    }),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('User expands a class with several pages', async () => {
      await userEvent.click(canvas.getByText('Thing'));
    });
    await step('The first page is shown', async () => {
      await expect(canvas.getByText('Thing on page 1')).toBeInTheDocument();
    });
    await step('User advances the pager', async () => {
      await userEvent.click(canvasElement.querySelector<HTMLButtonElement>('[data-testid="next-page"]')!);
    });
    await step('The second page is fetched and shown', async () => {
      await expect(canvas.getByText('Thing on page 2')).toBeInTheDocument();
      await expect(canvas.queryByText('Thing on page 1')).not.toBeInTheDocument();
    });
    await step('The pager survives the page change, so the view does not snap back to page 1', async () => {
      // app-pager holds its index privately with no input to set it: unmounting it resets to 0.
      await expect(canvasElement.querySelector('app-pager')).not.toBeNull();
    });
  },
};

/**
 * The two reports are deliberately separate — different endpoints, different services, no shared code —
 * and share only this screen. The toggle is the seam, so it is worth a story.
 */
export const SwitchesToThePropertyGroupedReport: Story = {
  name: 'Switches between the class-grouped and property-grouped reports',
  decorators: [withApi(of(makeClasses()), noValueFindings, of(makeItemsPage([makeResource()])))],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The class report is on screen first', async () => {
      await expect(canvas.getByText('Thing')).toBeInTheDocument();
      await expect(canvasElement.querySelector('app-view-restrictions-by-property-table')).toBeNull();
    });
    await step('User switches the grouping to Property', async () => {
      await userEvent.click(canvas.getByText('Property'));
    });
    await step('The property table replaces the class matrix', async () => {
      await expect(canvasElement.querySelector('app-view-restrictions-by-property-table')).not.toBeNull();
      await expect(canvasElement.querySelector('.matrix')).toBeNull();
    });
    await step('The item-type filter stays on screen — it means the same thing either way', async () => {
      await expect(canvas.getByText('Values')).toBeInTheDocument();
    });
  },
};
