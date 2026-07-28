import { OverlayModule } from '@angular/cdk/overlay';
import { ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { ResourceResultService } from '@dasch-swiss/vre/shared/app-helper-services';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { NEVER, of, throwError } from 'rxjs';
import { expect, userEvent, waitFor } from 'storybook/test';
import { SearchResultComponent } from './search-result.component';

const STORY_PROVIDERS = [
  provideAnimations(),
  provideRouter([{ path: '**', redirectTo: '' }]),
  { provide: UserService, useValue: { currentUser: null } as Partial<UserService> },
];

const makeReadResource = (id: string, label: string): ReadResource => {
  const r = new ReadResource();
  r.id = id;
  r.label = label;
  r.type = 'http://api.knora.org/ontology/knora-api/v2#Resource';
  r.properties = {};
  r.attachedToProject = 'http://rdfh.ch/projects/0001';
  r.attachedToUser = 'http://rdfh.ch/users/root';
  r.hasPermissions = 'CR knora-admin:SystemAdmin';
  r.userHasPermission = 'CR';
  r.versionArkUrl = '';
  r.arkUrl = '';
  return r;
};

const meta: Meta<SearchResultComponent> = {
  title: 'Search / Fulltext Search / Search Result',
  component: SearchResultComponent,
  argTypes: {
    query: { description: 'Fulltext search query string.' },
    projectId: { description: 'Optional project IRI to limit the search scope.' },
    showProjectShortname: { description: 'Whether to show the project shortname in the resource list.' },
  },
};
export default meta;
type Story = StoryObj<SearchResultComponent>;

const sharedProviders = [
  ...STORY_PROVIDERS,
  importProvidersFrom(OverlayModule),
  { provide: ResourceResultService, useValue: { pageIndex$: of(0), numberOfResults: 0 } },
];

export const NoResults: Story = {
  name: 'Shows no-results message when search returns empty list',
  args: { query: 'nonexistent term', showProjectShortname: false },
  decorators: [
    applicationConfig({
      providers: [
        ...sharedProviders,
        {
          provide: DspApiConnectionToken,
          useValue: {
            v2: {
              search: {
                doFulltextSearch: () => of({ resources: [] }),
                doFulltextSearchCountQuery: () => of({ numberOfResults: 0 }),
              },
            },
          },
        },
      ],
    }),
  ],
  play: async ({ canvasElement, step }) => {
    await step('No results component is rendered', async () => {
      await expect(canvasElement.querySelector('app-no-results-found')).not.toBeNull();
    });
  },
};

export const WithResults: Story = {
  name: 'Shows resource browser when search returns results',
  args: { query: 'test', showProjectShortname: false },
  decorators: [
    applicationConfig({
      providers: [
        ...sharedProviders,
        {
          provide: DspApiConnectionToken,
          useValue: {
            v2: {
              search: {
                doFulltextSearch: () =>
                  of({ resources: [makeReadResource('http://rdfh.ch/0001/res1', 'Test Resource')] }),
                doFulltextSearchCountQuery: () => of({ numberOfResults: 1 }),
              },
            },
          },
        },
      ],
    }),
  ],
  play: async ({ canvasElement, step }) => {
    await step('Resource browser is rendered', async () => {
      await expect(canvasElement.querySelector('app-resource-browser')).not.toBeNull();
    });
  },
};

export const WithResultsAndProjectFilter: Story = {
  name: 'Limits search results to a specific project when projectId is provided',
  args: {
    query: 'test',
    projectId: 'http://rdfh.ch/projects/0001',
    showProjectShortname: true,
  },
  decorators: [
    applicationConfig({
      providers: [
        ...sharedProviders,
        {
          provide: DspApiConnectionToken,
          useValue: {
            v2: {
              search: {
                doFulltextSearch: () =>
                  of({ resources: [makeReadResource('http://rdfh.ch/0001/res1', 'Project Resource')] }),
                doFulltextSearchCountQuery: () => of({ numberOfResults: 1 }),
              },
            },
          },
        },
      ],
    }),
  ],
  play: async ({ canvasElement, step }) => {
    await step('Resource browser is rendered for project-scoped results', async () => {
      await expect(canvasElement.querySelector('app-resource-browser')).not.toBeNull();
    });
  },
};

export const Loading: Story = {
  name: 'Shows progress indicator while search is in flight',
  args: { query: 'loading test' },
  decorators: [
    applicationConfig({
      providers: [
        ...sharedProviders,
        {
          provide: DspApiConnectionToken,
          useValue: {
            v2: {
              search: {
                doFulltextSearch: () => NEVER,
                doFulltextSearchCountQuery: () => NEVER,
              },
            },
          },
        },
      ],
    }),
  ],
  play: async ({ canvasElement, step }) => {
    await step('Progress indicator is shown', async () => {
      await expect(canvasElement.querySelector('app-progress-indicator')).not.toBeNull();
    });
    await step('Resource browser is not yet rendered', async () => {
      await expect(canvasElement.querySelector('app-resource-browser')).toBeNull();
    });
  },
};

// Failures are handed to the ErrorHandler for the snackbar; stub it so stories do not depend on the
// real AppErrorHandler (and its NotificationService) being wired up.
const silentErrorHandler = { provide: ErrorHandler, useValue: { handleError: () => {} } };

/**
 * First attempt fails, the retry succeeds — so one story covers the whole
 * `(click)` -> `retry.emit()` -> `(retry)` -> `onRetry()` -> search re-runs chain. `beforeEach` resets
 * the counter, so the sequence is deterministic however many times Storybook renders the story.
 */
let searchAttempt = 0;

export const SearchFails: Story = {
  name: 'Stops the spinner, shows a failure state, and re-runs the search when retried',
  args: { query: 'der' },
  beforeEach: () => {
    searchAttempt = 0;
  },
  decorators: [
    applicationConfig({
      providers: [
        ...sharedProviders,
        silentErrorHandler,
        {
          provide: DspApiConnectionToken,
          useValue: {
            v2: {
              search: {
                doFulltextSearch: () =>
                  searchAttempt++ === 0
                    ? throwError(() => new Error('500 from the triplestore'))
                    : of({ resources: [makeReadResource('http://rdfh.ch/0001/res1', 'Test Resource')] }),
                doFulltextSearchCountQuery: () => of({ numberOfResults: 1 }),
              },
            },
          },
        },
      ],
    }),
  ],
  play: async ({ canvasElement, step }) => {
    await step('Failure state is rendered', async () => {
      await expect(canvasElement.querySelector('app-search-failed')).not.toBeNull();
    });
    await step('Spinner has stopped', async () => {
      await expect(canvasElement.querySelector('app-progress-indicator')).toBeNull();
    });
    await step('Failure is not mistaken for an empty result set', async () => {
      await expect(canvasElement.querySelector('app-no-results-found')).toBeNull();
    });
    await step('Clicking Retry re-runs the search and renders the results', async () => {
      await userEvent.click(canvasElement.querySelector('[data-cy="search-failed-retry"]')!);
      await waitFor(async () => {
        await expect(canvasElement.querySelector('app-search-failed')).toBeNull();
        await expect(canvasElement.querySelector('app-resource-browser')).not.toBeNull();
      });
    });
  },
};

export const CountQueryFails: Story = {
  name: 'Still shows results when only the count query fails',
  args: { query: 'test' },
  decorators: [
    applicationConfig({
      providers: [
        ...sharedProviders,
        silentErrorHandler,
        {
          provide: DspApiConnectionToken,
          useValue: {
            v2: {
              search: {
                doFulltextSearch: () =>
                  of({ resources: [makeReadResource('http://rdfh.ch/0001/res1', 'Test Resource')] }),
                doFulltextSearchCountQuery: () => throwError(() => new Error('count query timed out')),
              },
            },
          },
        },
      ],
    }),
  ],
  play: async ({ canvasElement, step }) => {
    await step('Resource browser is rendered despite the count failure', async () => {
      await expect(canvasElement.querySelector('app-resource-browser')).not.toBeNull();
    });
    await step('No failure state, since the results themselves arrived', async () => {
      await expect(canvasElement.querySelector('app-search-failed')).toBeNull();
    });
  },
};
