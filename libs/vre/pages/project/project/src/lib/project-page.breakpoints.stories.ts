import { OverlayModule } from '@angular/cdk/overlay';
import { importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { ActivatedRoute, provideRouter, Router, withDisabledInitialNavigation } from '@angular/router';
import {
  Constants,
  KnoraApiConfig,
  KnoraApiConnection,
  ReadOntology,
  ReadResource,
  ReadTextValueAsString,
  ResourceClassAndPropertyDefinitions,
  ResourceClassDefinitionWithPropertyDefinition,
  ResourcePropertyDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import { ProjectApiService, UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import {
  AdminAPIApiService,
  APIV3ApiService,
  OntologyAndResourceClasses,
} from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AppConfigService, DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import {
  LocalizationService,
  OntologyService,
  ProjectDataRights,
  ProjectDataRightsService,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { expect, waitFor, within } from 'storybook/test';

import { DataBrowserPageComponent } from './data-browser-page.component';
import { DataClassViewComponent } from './data-class-view.component';
import { DataOverviewComponent } from './data-overview.component';
import { ProjectPageHeaderComponent } from './project-page-header.component';
import { ProjectPageService } from './project-page.service';
import { makeProjectPageServiceStub, makeReadProject } from './stories.helpers';

const ONTOLOGY_NAME = 'incunabula';
const ONTOLOGY_IRI = `http://0.0.0.0:3333/ontology/0803/${ONTOLOGY_NAME}/v2`;
const BOOK_CLASS_NAME = 'book';
const BOOK_CLASS_IRI = `${ONTOLOGY_IRI}#${BOOK_CLASS_NAME}`;

const BOOK_TITLES = [
  'Zeitglöcklein des Lebens und Leidens Christi',
  'Das Narrenschiff',
  'Stultifera navis',
  'Der Heiligen Leben',
  'Speculum humanae salvationis',
  'Defensorium inviolatae virginitatis Mariae',
  'Reise ins Heilige Land',
  'Postilla super totam Bibliam',
  'Quadragesimale',
  'Spiegel menschlicher Behältnis',
  'Der Ritter vom Turn',
  'Sermones de tempore',
  'Liber chronicarum',
  'Rosarium Mariae',
  'Epistolae et evangelia',
  'Doctrinale',
  'Varia carmina',
  'Passionale',
];

const resourceClass = (
  name: string,
  label: string,
  itemCount: number,
  representationClass = 'WithoutRepresentation'
) => ({
  resourceClass: {
    iri: `${ONTOLOGY_IRI}#${name}`,
    representationClass,
    label: [{ language: 'en', value: label }],
  },
  itemCount,
});

const PROJECT_ONTOLOGIES = [
  {
    ontology: { iri: ONTOLOGY_IRI, label: 'The incunabula ontology', comment: '' },
    classesAndCount: [
      resourceClass(BOOK_CLASS_NAME, 'Book', BOOK_TITLES.length),
      resourceClass('page', 'Page', 2237, 'StillImageRepresentation'),
      resourceClass('Sideband', 'Sideband', 22, 'StillImageRepresentation'),
      resourceClass('misc', 'Miscellaneous', 6),
    ],
  },
] as OntologyAndResourceClasses[];

// The class view looks the routed class up in the project's ontologies (ProjectPageService.ontologies$).
const ONTOLOGY = {
  id: ONTOLOGY_IRI,
  classes: {
    [BOOK_CLASS_IRI]: {
      id: BOOK_CLASS_IRI,
      labels: [{ language: 'en', value: 'Book' }],
      comments: [{ language: 'en', value: 'A printed book (incunable), described by its title and imprint.' }],
    },
  },
} as unknown as ReadOntology;

const PROJECT = makeReadProject({
  id: 'http://rdfh.ch/projects/0803',
  shortcode: '0803',
  shortname: ONTOLOGY_NAME,
  longname: 'Bilderfolgen Basler Frühdrucke: Spätmittelalterliche Didaxe als Bild-Text-Lektüre',
  description: [
    {
      language: 'en',
      value:
        'The incunabula project studies the woodcut sequences of early Basel prints and how text and ' +
        'image were read together in late medieval didactic books.',
    },
  ],
});

const textProperty = (name: string, label: string, guiOrder: number) => {
  const def = new ResourcePropertyDefinitionWithAllLanguages();
  def.id = `${ONTOLOGY_IRI}#${name}`;
  def.label = label;
  def.labels = [{ language: 'en', value: label }];
  def.objectType = Constants.TextValue;
  def.subPropertyOf = [];
  def.isLinkProperty = false;
  def.isEditable = true;
  return { propertyIndex: def.id, cardinality: 1, guiOrder, isInherited: false, propertyDefinition: def };
};

const textValue = (id: string, text: string) => {
  const value = new ReadTextValueAsString();
  value.id = id;
  value.text = text;
  value.type = Constants.TextValue;
  value.userHasPermission = 'RV';
  return value;
};

const BOOK_PROPERTIES = [
  textProperty('title', 'Title', 1),
  textProperty('publisher', 'Publisher', 2),
  textProperty('pubdate', 'Date of publication', 3),
  textProperty('description', 'Description', 4),
];

// A book with a few text properties, so the resource viewer next to the list has content to lay out.
const makeBook = (title: string, index: number): ReadResource => {
  const book = new ReadResource();
  book.id = `http://rdfh.ch/0803/book-${index}`;
  book.type = BOOK_CLASS_IRI;
  book.label = title;
  book.attachedToProject = PROJECT.id;
  book.attachedToUser = 'http://rdfh.ch/users/test';
  book.userHasPermission = 'V';
  book.creationDate = '2024-03-15T10:30:00Z';
  book.resourceClassLabel = 'Book';
  const texts = [
    title,
    'Johann Bergmann von Olpe, Basel',
    `${1492 + (index % 8)}`,
    'Woodcut sequence with accompanying verses; the images and the text are meant to be read side by side.',
  ];
  book.properties = Object.fromEntries(
    BOOK_PROPERTIES.map((prop, i) => [prop.propertyIndex, [textValue(`${book.id}/values/${i}`, texts[i])]])
  );
  book.entityInfo = new ResourceClassAndPropertyDefinitions(
    {
      [BOOK_CLASS_IRI]: {
        label: 'Book',
        labels: [{ language: 'en', value: 'Book' }],
        getResourcePropertiesList: () => BOOK_PROPERTIES,
        propertiesList: BOOK_PROPERTIES,
      } as unknown as ResourceClassDefinitionWithPropertyDefinition,
    },
    {}
  );
  return book;
};

const BOOKS = BOOK_TITLES.map(makeBook);

const DATA_RIGHTS: ProjectDataRights = {
  defaultDataAuthorship: [],
  licenseLabel: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  copyrightHolder: 'University of Basel',
  isPlaceholderLicense: false,
  isPlaceholderCopyrightHolder: false,
};

const PROJECT_RESPONSE = {
  project: { id: PROJECT.id, shortcode: PROJECT.shortcode, shortname: PROJECT.shortname, longname: PROJECT.longname },
};

const ontologyServiceStub = (classSelected: boolean): Partial<OntologyService> => ({
  getIriBaseUrl: () => 'http://0.0.0.0:3333',
  getOntologyIriFromRoute: () => (classSelected ? ONTOLOGY_IRI : undefined),
  getClassIdFromParams: () => (classSelected ? BOOK_CLASS_IRI : undefined),
});

/**
 * The navigation tabs and the sidenav are not routed in the story, so they read this stub: the
 * snapshot marks the Data tab as active, `firstChild` carries the class the sidenav highlights.
 */
const activatedRouteStub = (firstChild: unknown) => ({
  snapshot: { children: [{ url: [{ path: 'data' }] }] },
  firstChild,
});

/**
 * The project page on its Data tab: project header with navigation tabs, the ontology/class
 * sidenav and, on the right, whatever the Data tab's router outlet shows. Pixeleye captures each
 * story at every breakpoint (`pixeleye.breakpoints.config.ts`); in Storybook, pick a width from the
 * viewport toolbar.
 */
const meta: Meta = {
  title: 'Pages / Breakpoints / Project Data',
  parameters: { layout: 'fullscreen' },
  decorators: [
    moduleMetadata({ imports: [ProjectPageHeaderComponent, DataBrowserPageComponent] }),
    applicationConfig({
      providers: [
        importProvidersFrom(OverlayModule),
        {
          provide: ProjectPageService,
          useValue: makeProjectPageServiceStub({
            currentProject$: of(PROJECT),
            ontologies$: of([ONTOLOGY]),
            hasProjectMemberRights$: of(false),
          }),
        },
        {
          provide: APIV3ApiService,
          useValue: { getV3ProjectsProjectiriResourcesperontology: () => of(PROJECT_ONTOLOGIES) },
        },
        {
          provide: LocalizationService,
          useValue: { currentLanguage: 'en', currentLanguage$: of('en') },
        },
        {
          provide: ProjectDataRightsService,
          // The project description reads it from the project, the resource viewer by project IRI.
          useValue: { fromProject: () => of(DATA_RIGHTS), forProject: () => of(DATA_RIGHTS) },
        },
        { provide: UserService, useValue: { isLoggedIn$: of(false), user$: of(null), isSysAdmin$: of(false) } },
        // The resource viewer resolves the resource's project and creator.
        {
          provide: ProjectApiService,
          useValue: { get: () => of(PROJECT_RESPONSE) },
        },
        {
          provide: AdminAPIApiService,
          useValue: {
            getAdminProjectsIriProjectiri: () => of(PROJECT_RESPONSE),
            getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses: () => of({ licenses: [] }),
          },
        },
        { provide: UserApiService, useValue: { get: () => of({ user: { givenName: 'Jane', familyName: 'Doe' } }) } },
        { provide: NotificationService, useValue: { openSnackBar: () => {} } },
        {
          provide: DspApiConnectionToken,
          useValue: {
            v2: {
              // The class list: one page of books and the class count.
              search: {
                doExtendedSearch: () => of({ resources: BOOKS, mayHaveMoreResults: false }),
                doExtendedSearchCountQuery: () => of({ numberOfResults: BOOKS.length }),
                doSearchIncomingLinks: () => of({ resources: [], mayHaveMoreResults: false }),
                // No page images attached: the viewer shows the book as a plain resource.
                doSearchStillImageRepresentationsCount: () => of({ numberOfResults: 0 }),
              },
              // The resource viewer: the first book, selected when the list loads.
              res: {
                getResource: (iri: string) => of(BOOKS.find(book => book.id === iri) ?? BOOKS[0]),
                canDeleteResource: () => of({ canDo: false }),
              },
            },
          } as unknown as KnoraApiConnection,
        },
        {
          provide: AppConfigService,
          useValue: {
            dspConfig: { production: false, environment: 'dev', release: '0.0.0', color: 'accent' },
            dspApiConfig: new KnoraApiConfig('https', 'api.example.com'),
            dspAppConfig: { iriBase: 'http://rdfh.ch' },
          },
        },
      ],
    }),
  ],
  render: () => ({
    // Mirrors ProjectPageComponent, whose `.content` sets the same height around its outlet.
    template: `
      <app-project-page-header />
      <div style="height: calc(100vh - 106px)">
        <app-data-browser-page />
      </div>
    `,
  }),
};
export default meta;
type Story = StoryObj;

const CLASS_PARAMS = {
  [RouteConstants.ontologyParameter]: ONTOLOGY_NAME,
  [RouteConstants.classParameter]: BOOK_CLASS_NAME,
};

export const DataTab: Story = {
  name: 'Shows the selected class with its resource list and the first resource',
  decorators: [
    applicationConfig({
      providers: [
        // The Data tab's outlet routes `:ontology/:class` to the class view, as in app.routes.ts.
        // The story iframe's own URL is not an app route, so the router navigates there itself,
        // without touching the browser location.
        provideRouter(
          [
            {
              path: `:${RouteConstants.ontologyParameter}/:${RouteConstants.classParameter}`,
              component: DataClassViewComponent,
            },
          ],
          withDisabledInitialNavigation()
        ),
        provideAppInitializer(() => {
          inject(Router).navigate([ONTOLOGY_NAME, BOOK_CLASS_NAME], { skipLocationChange: true });
        }),
        { provide: ActivatedRoute, useValue: activatedRouteStub({ params: of(CLASS_PARAMS) }) },
        { provide: OntologyService, useValue: ontologyServiceStub(true) },
      ],
    }),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Project name is shown in the header', async () => {
      const header = canvasElement.querySelector('app-project-page-header') as HTMLElement;
      await expect(await within(header).findByText(PROJECT.longname)).toBeInTheDocument();
    });
    await step('Book is selected in the sidenav', async () => {
      const sidenav = canvasElement.querySelector('app-project-sidenav') as HTMLElement;
      const book = (await within(sidenav).findByText('Book')).closest('.item');
      await waitFor(() => expect(book).toHaveClass('selected'));
    });
    await step('The class header shows the class title and the result count', async () => {
      const panel = canvasElement.querySelector('app-data-class-panel') as HTMLElement;
      await expect(await within(panel).findByRole('heading', { name: 'Book' })).toBeInTheDocument();
      await expect(await within(panel).findByText(`${BOOKS.length} results`)).toBeInTheDocument();
    });
    await step('The resource list shows the books', async () => {
      await waitFor(() => expect(canvasElement.querySelectorAll('app-resource-list-item')).toHaveLength(BOOKS.length));
    });
    await step('The first book is open in the resource viewer', async () => {
      const viewer = canvasElement.querySelector('app-multiple-viewer') as HTMLElement;
      await waitFor(() => expect(viewer.textContent).toContain('Johann Bergmann von Olpe, Basel'));
    });
    await step('The class view replaces the project description', async () => {
      await expect(canvas.queryByText(/woodcut sequences of early Basel prints/)).toBeNull();
    });
  },
};

export const DataTabWithoutClass: Story = {
  name: 'Shows the project description when no class is selected',
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([{ path: '**', component: DataOverviewComponent }]),
        { provide: ActivatedRoute, useValue: activatedRouteStub(null) },
        { provide: OntologyService, useValue: ontologyServiceStub(false) },
      ],
    }),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Resource classes are listed in the sidenav', async () => {
      await expect(await canvas.findByText('Book')).toBeInTheDocument();
    });
    await step('Project description is shown', async () => {
      await expect(await canvas.findByText(/woodcut sequences/)).toBeInTheDocument();
    });
  },
};
