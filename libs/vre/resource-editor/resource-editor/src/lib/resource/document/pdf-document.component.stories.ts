import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { expect } from 'storybook/test';

import { FileRepresentationInput, ParentResourceInput } from '../../representation/representation-inputs';
import { RepresentationService } from '../../representation/representation.service';
import { ResourceFetcherService } from '../../representation/resource-fetcher.service';
import { STORY_PDF_URL, waitForPdfPainted } from '../../stories.helpers';
import { PdfDocumentComponent } from './pdf-document.component';

const makeSrc = (fileUrl = STORY_PDF_URL): FileRepresentationInput => ({
  fileUrl,
  userHasPermission: 'RV',
  filename: 'document.pdf',
});

const makeParentResource = (): ParentResourceInput => ({
  id: 'http://rdfh.ch/resource/1',
  properties: {},
  attachedToProject: 'http://rdfh.ch/project/1',
  type: 'http://api.dasch.swiss/ontology/knora-api/v2#DocumentRepresentation',
});

const representationServiceStub: Partial<RepresentationService> = {
  getFileInfo: () => of({ originalFilename: 'document.pdf' }),
  downloadProjectFile: () => {},
};

const resourceFetcherServiceStub: Partial<ResourceFetcherService> = {
  userCanEdit$: of(false),
  projectShortcode$: of('0001'),
};

const meta: Meta<PdfDocumentComponent> = {
  title: 'Resource Editor / Resource / PDF / PDF Document',
  component: PdfDocumentComponent,
  decorators: [
    story => {
      const s = story();
      return {
        ...s,
        template: `<div style="height: 600px; background-color: black">${s.template ?? '<app-pdf-document [src]="src" [parentResource]="parentResource" />'}</div>`,
      };
    },
    applicationConfig({
      providers: [
        { provide: RepresentationService, useValue: representationServiceStub },
        { provide: ResourceFetcherService, useValue: resourceFetcherServiceStub },
      ],
    }),
  ],
  argTypes: {
    src: {
      description: 'File value containing the PDF URL.',
      table: { type: { summary: 'FileRepresentationInput' }, category: 'State' },
    },
    parentResource: {
      description: 'The parent resource the PDF belongs to.',
      table: { type: { summary: 'ParentResourceInput' }, category: 'State' },
    },
  },
};
export default meta;
type Story = StoryObj<PdfDocumentComponent>;

export const WithLivePdf: Story = {
  name: 'Renders a real PDF from a public source',
  args: {
    src: makeSrc(),
    parentResource: makeParentResource(),
  },
  play: async ({ canvasElement, step }) => {
    await step('PDF page is painted', async () => {
      await waitForPdfPainted(canvasElement);
    });
  },
};

export const WithError: Story = {
  name: 'Shows error message when PDF fails to load',
  render: args => ({
    props: { ...args, failedToLoad: true },
  }),
  args: {
    src: makeSrc(),
    parentResource: makeParentResource(),
  },
  play: async ({ canvasElement, step }) => {
    await step('Error message component is rendered', async () => {
      const errMsg = canvasElement.querySelector('app-representation-error-message');
      await expect(errMsg).not.toBeNull();
    });
  },
};
