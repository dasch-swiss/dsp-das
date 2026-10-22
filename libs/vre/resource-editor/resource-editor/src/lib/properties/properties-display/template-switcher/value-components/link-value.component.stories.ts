import { OverlayModule } from '@angular/cdk/overlay';
import { importProvidersFrom } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { expect, userEvent, waitFor } from 'storybook/test';

import { LinkValueDataService } from './link-value-data.service';
import { LinkValueComponent } from './link-value.component';

const linkValueDataServiceStub: Partial<LinkValueDataService> = {
  onInit: () => {},
  resourceClasses: [],
};

const ANYTHING = 'http://api.dasch.swiss/ontology/0001/anything/v2';

// The component provides its own LinkValueDataService, so the real one runs on what these return:
// a link property and its link value property, as the API describes them.
const linkProperty = Object.assign(new ResourcePropertyDefinition(), {
  id: `${ANYTHING}#hasOtherThing`,
  objectType: `${ANYTHING}#Thing`,
  isLinkProperty: true,
});
const linkValueProperty = Object.assign(new ResourcePropertyDefinition(), {
  id: `${ANYTHING}#hasOtherThingValue`,
  isLinkValueProperty: true,
});

const dspApiConnectionStub = {
  v2: {
    ontologyCache: {
      reloadCachedItem: () => of(new Map()),
      getOntology: () => of(new Map()),
      getResourceClassDefinition: () =>
        of({ classes: {}, properties: { [linkProperty.id]: linkProperty, [linkValueProperty.id]: linkValueProperty } }),
    },
    search: {
      doSearchByLabel: () => of({ resources: [] }),
    },
  },
};

const meta: Meta<LinkValueComponent> = {
  title:
    'Resource Editor / 4. Properties / Resource Default Tabs / Properties Display / Template Switcher / Link Value',
  component: LinkValueComponent,
  decorators: [
    applicationConfig({
      providers: [
        importProvidersFrom(OverlayModule),
        { provide: DspApiConnectionToken, useValue: dspApiConnectionStub },
        { provide: LinkValueDataService, useValue: linkValueDataServiceStub },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(null) }) } },
      ],
    }),
  ],
  argTypes: {
    control: {
      description: 'FormControl bound to the linked resource IRI.',
      table: { type: { summary: 'FormControl<string | null>' }, category: 'State' },
    },
    propIri: {
      description: 'IRI of the link property.',
      table: { type: { summary: 'string' }, category: 'State' },
    },
    resourceClassIri: {
      description: 'IRI of the target resource class constraint.',
      table: { type: { summary: 'string' }, category: 'State' },
    },
    projectIri: {
      description: 'IRI of the project.',
      table: { type: { summary: 'string' }, category: 'State' },
    },
    projectShortcode: {
      description: 'Shortcode of the project.',
      table: { type: { summary: 'string' }, category: 'State' },
    },
  },
};
export default meta;
type Story = StoryObj<LinkValueComponent>;

export const Empty: Story = {
  name: 'Shows empty search input for linked resource',
  args: {
    control: new FormControl<string | null>(null),
    propIri: 'http://api.dasch.swiss/ontology/0001/anything/v2#hasOtherThing',
    resourceClassIri: 'http://api.dasch.swiss/ontology/0001/anything/v2#Thing',
    projectIri: 'http://rdfh.ch/projects/0001',
    projectShortcode: '0001',
  },
  play: async ({ canvasElement, step }) => {
    await step('Link search input is rendered', async () => {
      const input = canvasElement.querySelector('[data-cy="link-input"]');
      await expect(input).not.toBeNull();
    });
  },
};

/**
 * The search help shows only while it can help — the field is focused and fewer than three letters
 * are typed — so at rest the compact editor reserves no line for it under the field (DEV-7611).
 */
export const ShowsSearchHelpOnlyWhileNeeded: Story = {
  name: 'Shows the search help only while focused and fewer than three letters are typed',
  // The link *value* property, as the editor is given in the app.
  args: { ...Empty.args, control: new FormControl<string | null>(null), propIri: `${ANYTHING}#hasOtherThingValue` },
  // As the template editor switcher provides it to every value editor.
  decorators: [
    applicationConfig({
      providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } }],
    }),
  ],
  play: async ({ canvasElement, step }) => {
    const input = canvasElement.querySelector('[data-cy="link-input"]') as HTMLInputElement;
    const help = () => canvasElement.querySelector('[data-cy="link-search-help"]');

    await step('At rest, no help is shown and no line is kept for it', async () => {
      await expect(help()).toBeNull();
      const field = canvasElement.querySelector('mat-form-field') as HTMLElement;
      const box = canvasElement.querySelector('.mat-mdc-text-field-wrapper') as HTMLElement;
      await expect(field.getBoundingClientRect().height).toBeLessThanOrEqual(box.getBoundingClientRect().height + 0.5);
    });
    await step('Focusing the empty field shows the help', async () => {
      await userEvent.click(input);
      await waitFor(() => expect(help()).not.toBeNull());
    });
    await step('Typing three letters hides the help', async () => {
      await userEvent.type(input, 'abc');
      await waitFor(() => expect(help()).toBeNull());
    });
    await step('Leaving the field keeps it hidden', async () => {
      await userEvent.clear(input);
      await userEvent.tab();
      await waitFor(() => expect(help()).toBeNull());
    });
  },
};
