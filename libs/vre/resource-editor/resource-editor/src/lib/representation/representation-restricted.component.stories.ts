import { type Meta, type StoryObj } from '@storybook/angular';
import { expect, within } from 'storybook/test';

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
    const canvas = within(canvasElement);

    await step('The alert banner renders the translated no-permission message', async () => {
      await expect(canvasElement.querySelector('app-alert-info')).not.toBeNull();
      // Assert the resolved translation rather than only the element: a missing or renamed
      // `resourceEditor.representations.noPermission` key would render the raw key and still
      // satisfy an element-presence check.
      await expect(await canvas.findByText('You do not have permission to view this media file.')).toBeVisible();
    });
  },
};
