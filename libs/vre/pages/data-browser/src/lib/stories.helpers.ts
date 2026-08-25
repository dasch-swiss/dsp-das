import { provideRouter } from '@angular/router';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { UserService } from '@dasch-swiss/vre/core/session';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { of } from 'rxjs';
import { MultipleViewerService } from './comparison/multiple-viewer.service';
import { ProjectShortnameService } from './project-shortname.service';

const TEST_RESOURCE_TYPE = 'http://0.0.0.0:3333/ontology/0001/test/v2#Book';

/**
 * `entityInfo` and `resourceClassLabel` mirror what dsp-js fills in when converting a search
 * response, so components reading the resource class (DEV-5452) see realistic data.
 */
export const makeReadResource = (partial: Partial<ReadResource> = {}): ReadResource => {
  const type = partial.type ?? TEST_RESOURCE_TYPE;
  return {
    id: 'http://rdfh.ch/0001/resource1',
    type,
    label: 'Test Resource',
    attachedToProject: 'http://rdfh.ch/projects/0001',
    attachedToUser: 'http://rdfh.ch/users/testuser',
    properties: {},
    resourceClassLabel: 'Book',
    entityInfo: {
      classes: {
        [type]: { labels: [{ language: 'en', value: 'Book' }] },
      },
      properties: {},
    },
    ...partial,
  } as ReadResource;
};

export const makeMultipleViewerServiceStub = (
  partial: Partial<MultipleViewerService> = {}
): Partial<MultipleViewerService> => ({
  selectedResources$: of([]),
  selectMode: false,
  searchKeyword: undefined,
  selectOneResource: () => {},
  addResources: () => {},
  removeResources: () => {},
  reset: () => {},
  ...partial,
});

export const makeUserServiceStub = (partial: Partial<UserService> = {}): Partial<UserService> => ({
  isSysAdmin$: of(false),
  user$: of(null),
  currentUser: null,
  ...partial,
});

export const makeLocalizationServiceStub = (language = 'en'): Partial<LocalizationService> => ({
  currentLanguage: language as LocalizationService['currentLanguage'],
  currentLanguage$: of(language as LocalizationService['currentLanguage']),
});

export const STORY_PROVIDERS = [
  provideRouter([{ path: '**', component: class {} }]),
  { provide: UserService, useValue: makeUserServiceStub() },
  { provide: LocalizationService, useValue: makeLocalizationServiceStub() },
  { provide: ProjectShortnameService, useValue: { getProjectShortname: () => of('testproj') } },
  { provide: MultipleViewerService, useValue: makeMultipleViewerServiceStub() },
];
