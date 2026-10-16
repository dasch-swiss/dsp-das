import { type Meta, type StoryObj } from '@storybook/angular';

import { HeaderComponent } from './header.component';
import * as HeaderStories from './header.component.stories';

/**
 * The global header at full viewport width. Pixeleye captures these at every breakpoint
 * (`pixeleye.breakpoints.config.ts`); in Storybook, pick a width from the viewport toolbar.
 */
const meta: Meta<HeaderComponent> = {
  title: 'Pages / Breakpoints / Header',
  component: HeaderComponent,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<HeaderComponent>;

export const LoggedOut: Story = {
  ...HeaderStories.LoggedOut,
  name: 'Shows the logged-out header across the full width',
};

export const LoggedIn: Story = {
  ...HeaderStories.LoggedIn,
  name: 'Shows the logged-in header across the full width',
};
