import { type Meta, type StoryObj } from '@storybook/angular';

import { ProjectOverviewComponent } from './project-overview.component';
import * as ProjectOverviewStories from './project-overview.stories';

/**
 * The home page project list at full viewport width. Pixeleye captures these at every breakpoint
 * (`pixeleye.breakpoints.config.ts`); in Storybook, pick a width from the viewport toolbar.
 */
const meta: Meta<ProjectOverviewComponent> = {
  title: 'Pages / Breakpoints / Home',
  component: ProjectOverviewComponent,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<ProjectOverviewComponent>;

export const AsRegularUser: Story = {
  ...ProjectOverviewStories.AsRegularUser,
  name: 'Shows my projects and other projects across the full width',
};

export const AsSysAdmin: Story = {
  ...ProjectOverviewStories.AsSysAdmin,
  name: 'Shows all projects across the full width for a system administrator',
};
