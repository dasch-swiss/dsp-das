import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';

import { AppProgressIndicatorComponent } from './app-progress-indicator.component';

const meta: Meta<AppProgressIndicatorComponent> = {
  title: 'UI / Progress Indicator',
  component: AppProgressIndicatorComponent,
  argTypes: {
    size: {
      description:
        'Controls the diameter of the spinner. Use "xsmall" or "small" for inline contexts, "large" for full-page loading states.',
      control: 'select',
      options: ['xsmall', 'small', 'medium', 'large'],
      table: {
        type: { summary: "'xsmall' | 'small' | 'medium' | 'large'" },
        defaultValue: { summary: 'small' },
        category: 'Appearance',
      },
    },
    onDark: {
      description:
        'Strokes the spinner in a light colour so it stays legible on dark surfaces such as the media representation container. Off by default.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' }, category: 'Appearance' },
    },
  },
};
export default meta;
type Story = StoryObj<AppProgressIndicatorComponent>;

export const Default: Story = {
  name: 'Shows spinner at default (small) size',
  args: { size: 'small' },
  play: async ({ canvasElement, step }) => {
    await step('Spinner element is rendered in the DOM', async () => {
      await expect(canvasElement.querySelector('[data-cy="loader"]')).not.toBeNull();
    });
  },
};

export const MediumSize: Story = {
  name: 'Shows medium spinner for section-level loading',
  args: { size: 'medium' },
};

export const LargeSize: Story = {
  name: 'Shows large spinner for full-page loading states',
  args: { size: 'large' },
};

export const OnDarkSurface: Story = {
  name: 'Shows a light spinner that stays legible on a dark surface',
  args: { size: 'medium', onDark: true },
  decorators: [
    componentWrapperDecorator(story => `<div style="background: rgb(41, 41, 41); padding: 24px">${story}</div>`),
  ],
  play: async ({ canvasElement, step }) => {
    await step('Spinner is stroked in the light colour, not the default blue', async () => {
      const stroke = canvasElement.querySelector('[data-cy="loader"] svg g')?.getAttribute('stroke');
      await expect(stroke).toBe('#e8eef4');
    });
  },
};
