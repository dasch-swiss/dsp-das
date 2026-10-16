import { provideRouter } from '@angular/router';
import { KnoraApiConfig, KnoraApiConnection, StoredProject } from '@dasch-swiss/dsp-js';
import { AppConfigService, DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { HeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { expect, within } from 'storybook/test';

import { AllProjectsService } from './all-projects.service';
import { ProjectOverviewComponent } from './project-overview.component';

const makeProject = (shortcode: string, shortname: string, longname: string): StoredProject => {
  const p = new StoredProject();
  p.id = `http://rdfh.ch/projects/${shortcode}`;
  p.shortcode = shortcode;
  p.shortname = shortname;
  p.longname = longname;
  p.selfjoin = false;
  p.keywords = [];
  p.description = [];
  return p;
};

const MY_PROJECTS = [
  makeProject('0803', 'rosetta', 'Bernstein Online'),
  makeProject('0801', 'incunabula', 'Incunabula'),
];

const OTHER_PROJECTS = [
  makeProject('0804', 'dokubib', 'Dokumentation von Bibliotheken'),
  makeProject('0806', 'images', 'Images and Objects'),
  makeProject('0807', 'knora', 'Knora Demo'),
];

const homeProviders = (userService: Partial<UserService>) => [
  provideRouter([]),
  { provide: UserService, useValue: userService },
  {
    provide: AllProjectsService,
    useValue: { allProjects$: of([...MY_PROJECTS, ...OTHER_PROJECTS]), otherProjects$: of(OTHER_PROJECTS) },
  },
  // Global header
  { provide: DspApiConnectionToken, useValue: {} as KnoraApiConnection },
  {
    provide: AppConfigService,
    useValue: {
      dspConfig: { production: false, environment: 'dev', release: '0.0.0', color: 'accent' },
      dspApiConfig: new KnoraApiConfig('https', 'api.example.com'),
    },
  },
];

/**
 * The home page as users see it: global header and project list. Pixeleye captures it at every
 * breakpoint (`pixeleye.breakpoints.config.ts`); in Storybook, pick a width from the viewport
 * toolbar.
 */
const meta: Meta = {
  title: 'Pages / Breakpoints / Home',
  parameters: { layout: 'fullscreen' },
  decorators: [moduleMetadata({ imports: [HeaderComponent, ProjectOverviewComponent] })],
  // Mirrors GlobalPageComponent, which renders the header above the routed page.
  render: () => ({ template: `<app-header /><app-project-overview />` }),
};
export default meta;
type Story = StoryObj;

export const AsRegularUser: Story = {
  name: 'Shows the header, my projects and other projects for a logged-in user',
  decorators: [
    applicationConfig({
      providers: homeProviders({
        isLoggedIn$: of(true),
        user$: of({ username: 'john.doe', givenName: 'John', familyName: 'Doe' } as any),
        userProjects$: of(MY_PROJECTS),
        isSysAdmin$: of(false),
      }),
    }),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The global header is shown', async () => {
      await expect(canvasElement.querySelector('app-header app-header-user-actions')).not.toBeNull();
    });
    await step('"Bernstein Online" card is visible in my projects', async () => {
      await expect(canvas.getByText('Bernstein Online')).toBeInTheDocument();
    });
    await step('"Dokumentation von Bibliotheken" card is visible in other projects', async () => {
      await expect(canvas.getByText('Dokumentation von Bibliotheken')).toBeInTheDocument();
    });
  },
};

export const AsAnonymousVisitor: Story = {
  name: 'Shows the header with the login button and all projects for a visitor',
  decorators: [
    applicationConfig({
      providers: homeProviders({
        isLoggedIn$: of(false),
        user$: of(null),
        userProjects$: of([]),
        isSysAdmin$: of(false),
      }),
    }),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The login button is shown in the header', async () => {
      await expect(
        within(canvasElement.querySelector('app-header') as HTMLElement).getByText(/login/i)
      ).toBeInTheDocument();
    });
    await step('"Dokumentation von Bibliotheken" card is visible', async () => {
      await expect(canvas.getByText('Dokumentation von Bibliotheken')).toBeInTheDocument();
    });
  },
};
