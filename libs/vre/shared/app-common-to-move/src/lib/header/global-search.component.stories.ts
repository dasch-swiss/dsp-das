import { provideRouter } from '@angular/router';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';

import { GlobalSearchComponent } from './global-search.component';

const meta: Meta<GlobalSearchComponent> = {
  title: 'Shared / Header / Global Search',
  component: GlobalSearchComponent,
  decorators: [
    applicationConfig({
      // A `search/:q` route so a valid term's navigation resolves instead of rejecting with
      // "Cannot match any routes" — the component navigates on submit.
      providers: [provideRouter([{ path: 'search/:q', children: [] }])],
    }),
  ],
};
export default meta;
type Story = StoryObj<GlobalSearchComponent>;

export const Empty: Story = {
  name: 'Shows search input with search icon button',
  play: async ({ canvasElement, step }) => {
    await step('Search input is rendered', async () => {
      await expect(canvasElement.querySelector('input')).not.toBeNull();
    });
    await step('Search icon button is rendered', async () => {
      await expect(canvasElement.querySelector('mat-icon')).not.toBeNull();
    });
  },
};

export const WithTypedQuery: Story = {
  name: 'Accepts typed search query in the input',
  play: async ({ canvasElement, step }) => {
    const input = canvasElement.querySelector('input') as HTMLInputElement;
    await step('User types a search query', async () => {
      await userEvent.type(input, 'medieval manuscripts');
      await expect(input.value).toBe('medieval manuscripts');
    });
  },
};

export const ShowsErrorWhenTermIsShorterThanThreeCharacters: Story = {
  name: 'Shows an inline message instead of searching a two-character term',
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector('input') as HTMLInputElement;
    await step('User submits a two-character term', async () => {
      await userEvent.type(input, 'de{enter}');
    });
    await step('The field explains what to change', async () => {
      await expect(await canvas.findByText('Enter at least 3 characters')).toBeVisible();
    });
  },
};

export const ShowsErrorWhenWildcardHasTooFewCharacters: Story = {
  name: 'Shows an inline message instead of searching a wildcard on a two-character stem',
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector('input') as HTMLInputElement;
    await step('User submits a wildcard on a short stem', async () => {
      await userEvent.type(input, 'de*{enter}');
    });
    await step('The field explains what to change', async () => {
      await expect(
        await canvas.findByText('A wildcard needs at least 3 other characters in the same word')
      ).toBeVisible();
    });
  },
};

export const AcceptsAWildcardOnALongEnoughStem: Story = {
  name: 'Searches a wildcard on a three-character stem without complaining',
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector('input') as HTMLInputElement;
    await step('User submits a valid wildcard term', async () => {
      await userEvent.type(input, 'ide*{enter}');
    });
    await step('No message is shown', async () => {
      await expect(canvas.queryByText('Enter at least 3 characters')).toBeNull();
      await expect(canvas.queryByText('A wildcard needs at least 3 other characters in the same word')).toBeNull();
    });
  },
};
