import { type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SearchFailedComponent } from './search-failed.component';

const onRetry = fn().mockName('retry');

const meta: Meta<SearchFailedComponent> = {
  title: 'UI / Search Failed',
  component: SearchFailedComponent,
  argTypes: {
    retry: {
      description: 'Emitted when the user clicks the Retry button.',
      table: { type: { summary: 'EventEmitter<void>' }, category: 'Events' },
    },
  },
};
export default meta;
type Story = StoryObj<SearchFailedComponent>;

export const Default: Story = {
  name: 'Shows the failure message and emits retry when the button is clicked',
  // A host template rather than args, so the assertion goes through the real
  // `(click)="retry.emit()"` binding instead of poking the output directly.
  render: () => ({
    props: { onRetry },
    template: '<app-search-failed (retry)="onRetry()" />',
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    onRetry.mockClear();

    await step('Failure title and message are shown', async () => {
      await expect(canvas.getByText(/Search failed/i)).toBeInTheDocument();
      await expect(canvas.getByText(/could not be completed/i)).toBeInTheDocument();
    });
    await step('The state is distinguishable from "no results found"', async () => {
      await expect(canvasElement.querySelector('mat-icon')?.textContent?.trim()).toBe('error_outline');
    });
    await step('Clicking Retry emits the retry output', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Retry/i }));
      await expect(onRetry).toHaveBeenCalledTimes(1);
    });
  },
};
