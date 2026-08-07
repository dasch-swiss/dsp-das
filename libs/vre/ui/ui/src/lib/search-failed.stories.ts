import { type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SearchFailedComponent } from './search-failed.component';

const onRetry = fn().mockName('retry');

const meta: Meta<SearchFailedComponent> = {
  title: 'UI / Search Failed',
  component: SearchFailedComponent,
  argTypes: {
    reason: {
      description: "The server's own explanation, shown in place of the generic message when present.",
      control: 'text',
      table: { type: { summary: 'string' }, category: 'Content' },
    },
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

export const WithServerReason: Story = {
  name: "Shows the server's own explanation instead of the generic message",
  args: {
    reason: 'A wildcard search term must contain at least 3 characters besides the wildcard.',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('The rejected query explains itself', async () => {
      await expect(canvas.getByText(/at least 3 characters/i)).toBeInTheDocument();
    });
    await step('The unhelpful generic advice is not shown alongside it', async () => {
      // "Please try again" cannot work for a query the server will keep rejecting (DEV-6866).
      await expect(canvas.queryByText(/Please try again/i)).toBeNull();
    });
  },
};
