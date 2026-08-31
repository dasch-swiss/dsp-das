import { type Meta, type StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';

import { RepresentationRestrictedComponent } from './representation-restricted.component';

const meta: Meta<RepresentationRestrictedComponent> = {
  title: 'Resource Editor / 3. Representation / Restricted',
  component: RepresentationRestrictedComponent,
};
export default meta;
type Story = StoryObj<RepresentationRestrictedComponent>;

export const ShowsNoPermissionMessageWhenFileValueIsWithheld: Story = {
  name: 'Shows a no-permission message when the file value is withheld',
  play: async ({ canvasElement, step }) => {
    await step('Alert banner is rendered instead of a player or spinner', async () => {
      await expect(canvasElement.querySelector('app-alert-info')).not.toBeNull();
      await expect(canvasElement.querySelector('app-progress-indicator')).toBeNull();
    });
  },
};
