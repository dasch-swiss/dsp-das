import { AdminAPIApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { expect } from 'storybook/test';

import { PLACEHOLDER_FILE_SENTINEL } from './is-placeholder-file-value';
import { ResourceFetcherService } from './resource-fetcher.service';
import { ResourceLegalComponent } from './resource-legal.component';

const LONG_LICENSE_ID = 'http://rdfh.ch/licenses/ai-generated';

const makeLicenses = () => [
  {
    id: 'http://example.org/custom-license',
    labelEn: 'Custom License',
    uri: 'https://example.org/license',
    labelDe: 'Eigene Lizenz',
  },
  {
    // A real built-in label (49 chars) — long enough to have collided into the rows beside it before
    // the grid layout landed. See DEV-6983.
    id: LONG_LICENSE_ID,
    labelEn: 'AI-Generated Content - Not Protected by Copyright',
    uri: 'http://rdfh.ch/licenses/ai-generated',
    labelDe: 'KI-generierter Inhalt - nicht urheberrechtlich geschützt',
  },
  {
    // The sentinel is both id and uri, and the label is a 96-char sentence. See DEV-6982.
    id: PLACEHOLDER_FILE_SENTINEL,
    labelEn: 'Placeholder License - Not a Real License only to be used when the real license is not known yet.',
    uri: PLACEHOLDER_FILE_SENTINEL,
    labelDe: 'Platzhalter-Lizenz',
  },
];

const makeFileValue = (overrides: Record<string, unknown> = {}) =>
  ({
    copyrightHolder: 'DaSCH',
    authorship: ['Jane Doe', 'John Smith'],
    license: { id: 'http://example.org/custom-license' },
    ...overrides,
  }) as any;

const meta: Meta<ResourceLegalComponent> = {
  title: 'Resource Editor / 3. Representation / Legal / Resource Legal',
  component: ResourceLegalComponent,
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: ResourceFetcherService,
          useValue: { projectShortcode$: of('test') },
        },
        {
          provide: AdminAPIApiService,
          useValue: {
            getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses: () => of({ data: makeLicenses() }),
          },
        },
      ],
    }),
  ],
  argTypes: {
    fileValue: {
      description: 'File value containing copyright, authorship and license information.',
      table: { type: { summary: 'ReadFileValue' }, category: 'State' },
    },
  },
};
export default meta;
type Story = StoryObj<ResourceLegalComponent>;

export const WithCopyrightAndAuthorship: Story = {
  name: 'Shows copyright holder, authorship and license',
  args: { fileValue: makeFileValue() },
  play: async ({ canvasElement, step }) => {
    await step('Copyright holder is displayed', async () => {
      await expect(canvasElement.textContent).toContain('DaSCH');
    });
    await step('Author names are displayed', async () => {
      await expect(canvasElement.textContent).toContain('Jane Doe');
    });
  },
};

export const WithoutLegalInfo: Story = {
  name: 'Renders nothing when no copyright or authorship is set',
  args: {
    fileValue: makeFileValue({ copyrightHolder: null, authorship: [], license: null }),
  },
  play: async ({ canvasElement, step }) => {
    await step('No legal block is rendered', async () => {
      await expect(canvasElement.textContent?.trim()).toBe('');
    });
  },
};

export const WithLongLicenseLabel: Story = {
  name: 'Keeps a long license label inside its own column',
  args: {
    fileValue: makeFileValue({
      copyrightHolder: 'University of Basel',
      authorship: ['Lotte Reiniger', 'Hilma af Klint'],
      license: { id: LONG_LICENSE_ID },
    }),
  },
  play: async ({ canvasElement, step }) => {
    await step('All three values are rendered', async () => {
      await expect(canvasElement.textContent).toContain('University of Basel');
      await expect(canvasElement.textContent).toContain('Lotte Reiniger');
      await expect(canvasElement.textContent).toContain('AI-Generated Content');
    });
    await step('The license row is labelled, like the other two', async () => {
      await expect(canvasElement.textContent).toContain('License');
    });
    await step('The copyright holder value is not fused into the license text', async () => {
      // The defect rendered "University of BaselAI-Generated…" as one run-on string.
      await expect(canvasElement.textContent).not.toContain('University of BaselAI-Generated');
    });
  },
};

export const WithPlaceholderValues: Story = {
  name: 'Shows "Placeholder" instead of the raw sentinel, with no dead link',
  args: {
    fileValue: makeFileValue({
      copyrightHolder: PLACEHOLDER_FILE_SENTINEL,
      authorship: [PLACEHOLDER_FILE_SENTINEL],
      license: { id: PLACEHOLDER_FILE_SENTINEL },
    }),
  },
  play: async ({ canvasElement, step }) => {
    await step('The raw sentinel is never shown', async () => {
      await expect(canvasElement.textContent).not.toContain(PLACEHOLDER_FILE_SENTINEL);
    });
    await step('The placeholder license prose sentence is not shown', async () => {
      await expect(canvasElement.textContent).not.toContain('Not a Real License');
      await expect(canvasElement.textContent).not.toContain('is not known yet');
    });
    await step('The readable marker is shown instead', async () => {
      await expect(canvasElement.textContent).toContain('Placeholder');
    });
    await step('The placeholder license renders without a link', async () => {
      await expect(canvasElement.querySelector('a')).toBeNull();
    });
  },
};
