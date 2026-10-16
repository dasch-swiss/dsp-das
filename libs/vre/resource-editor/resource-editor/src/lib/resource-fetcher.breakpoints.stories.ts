import { OverlayModule } from '@angular/cdk/overlay';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Constants, ReadMovingImageFileValue, ReadResource } from '@dasch-swiss/dsp-js';
import { ProjectApiService, UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { AdminAPIApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AppConfigService, DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { NEVER, of } from 'rxjs';
import { expect, waitFor } from 'storybook/test';

import { RepresentationService } from './representation/representation.service';
import { ResourceFetcherComponent } from './resource-fetcher.component';
import {
  makeEntityInfo,
  makeFilePropEntry,
  makePropEntry,
  makeTextPropDef,
  makeTextValue,
} from './resource-stories.helper';
import {
  appConfigServiceStub,
  notificationServiceStub,
  projectApiServiceStub,
  representationServiceStub,
  STORY_VIDEO_URL,
} from './stories.helpers';

const ONTOLOGY = 'http://0.0.0.0:3333/ontology/0001/example/v2';

// A video resource with a title, a description and a long-ish comment, so the property
// column has enough text to show how it wraps at each width.
const makeVideoResource = (): ReadResource => {
  const res = new ReadResource();
  res.id = 'http://rdfh.ch/0001/video-1';
  res.type = `${ONTOLOGY}#Video`;
  res.label = 'Interview with the project team, 2024';
  res.attachedToProject = 'http://rdfh.ch/projects/0001';
  res.attachedToUser = 'http://rdfh.ch/users/test';
  res.userHasPermission = 'V';
  res.creationDate = '2024-03-15T10:30:00Z';

  const title = makeTextPropDef(`${ONTOLOGY}#hasTitle`, 'Title');
  const description = makeTextPropDef(`${ONTOLOGY}#hasDescription`, 'Description');
  const comment = makeTextPropDef(`${ONTOLOGY}#hasComment`, 'Comment');

  res.properties = {
    [Constants.HasMovingImageFileValue]: [
      {
        type: Constants.MovingImageFileValue,
        fileUrl: STORY_VIDEO_URL,
        filename: 'video.mp4',
        userHasPermission: 'RV',
      } as unknown as ReadMovingImageFileValue,
    ],
    [title.id]: [makeTextValue('http://rdfh.ch/value/title-1', 'Interview with the project team')],
    [description.id]: [
      makeTextValue('http://rdfh.ch/value/desc-1', 'Recorded at the project kick-off in Basel, March 2024.'),
    ],
    [comment.id]: [
      makeTextValue(
        'http://rdfh.ch/value/comment-1',
        'The team describes how the sources were selected, transcribed and linked, and which questions ' +
          'the edition should answer. The recording was cut to the first five minutes for the online edition.'
      ),
    ],
  };
  res.entityInfo = makeEntityInfo(
    res.type,
    [
      makeFilePropEntry(Constants.HasMovingImageFileValue),
      makePropEntry(title, 1),
      makePropEntry(description, 2),
      makePropEntry(comment, 3),
    ],
    'Video'
  );
  return res;
};

/**
 * A single resource (video player and properties) at full viewport width. Pixeleye captures it at
 * every breakpoint (`pixeleye.breakpoints.config.ts`); in Storybook, pick a width from the
 * viewport toolbar.
 */
const meta: Meta<ResourceFetcherComponent> = {
  title: 'Pages / Breakpoints / Single Resource',
  component: ResourceFetcherComponent,
  argTypes: {
    resourceIri: {
      description: 'The IRI of the resource to load. Triggers a new fetch whenever it changes.',
      table: { type: { summary: 'string' }, category: 'Inputs' },
    },
    afterResourceDeleted: {
      description: 'Emitted when the fetched resource has been marked as deleted.',
      table: { category: 'Outputs', type: { summary: 'EventEmitter<ReadResource>' } },
    },
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    applicationConfig({
      providers: [
        importProvidersFrom(OverlayModule),
        provideRouter([{ path: '**', component: class {} }]),
        { provide: AppConfigService, useValue: appConfigServiceStub },
        { provide: ProjectApiService, useValue: projectApiServiceStub },
        {
          provide: AdminAPIApiService,
          useValue: {
            getAdminProjectsIriProjectiri: () => projectApiServiceStub.get(),
            getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses: () => of({ licenses: [] }),
          },
        },
        { provide: UserApiService, useValue: { get: () => of({ user: { givenName: 'Jane', familyName: 'Doe' } }) } },
        { provide: NotificationService, useValue: notificationServiceStub },
        { provide: RepresentationService, useValue: representationServiceStub },
        {
          provide: DspApiConnectionToken,
          useValue: {
            v2: {
              res: { getResource: () => of(makeVideoResource()), canDeleteResource: () => of({ canDo: false }) },
              search: { doSearchIncomingLinks: () => NEVER, doExtendedSearch: () => NEVER },
            },
          },
        },
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<ResourceFetcherComponent>;

export const VideoResource: Story = {
  name: 'Shows the video player and properties across the full width',
  args: { resourceIri: 'http://rdfh.ch/0001/video-1' },
  play: async ({ canvasElement, step }) => {
    await step('The video wrapper is rendered', async () => {
      await waitFor(() => expect(canvasElement.querySelector('app-resource-video')).not.toBeNull(), {
        timeout: 2000,
      });
    });
    await step('The properties are rendered', async () => {
      await waitFor(() => expect(canvasElement.textContent).toContain('Recorded at the project kick-off'), {
        timeout: 2000,
      });
    });
  },
};
