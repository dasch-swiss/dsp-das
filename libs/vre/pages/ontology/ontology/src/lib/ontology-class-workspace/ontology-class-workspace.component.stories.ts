import { LiveAnnouncer } from '@angular/cdk/a11y';
import { importProvidersFrom } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import type { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateModule } from '@ngx-translate/core';
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { MockComponent } from 'ng-mocks';
import { BehaviorSubject, of } from 'rxjs';
import type { ResourceClassInfo } from '../ontology.types';
import { ResourceClassInfoComponent } from '../resource-classes/resource-class-info/resource-class-info.component';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';
import { OntologyClassWorkspaceComponent } from './ontology-class-workspace.component';

/**
 * Minimal `ResourceClassInfo`-shaped stub. The workspace forwards the class
 * object to `<app-resource-class-info>` which we replace with a mock so the
 * story doesn't need to provision the full ResourceClassInfo dependency tree.
 */
const makeClass = (id: string, label = id): ResourceClassInfo =>
  ({
    id,
    label,
    resourceClassDefinition: { id, label, propertiesList: [] } as unknown as ResourceClassDefinitionWithAllLanguages,
  }) as unknown as ResourceClassInfo;

const makeProviders = (classes: ResourceClassInfo[], selected: Set<string>) => {
  const currentOntologyClasses$ = new BehaviorSubject<ResourceClassInfo[]>(classes);
  const selectedClassIris$ = new BehaviorSubject<Set<string>>(selected);
  const isTransacting$ = new BehaviorSubject<boolean>(false);

  return [
    {
      provide: OntologyEditorViewService,
      useValue: { selectedClassIris$, setPropertyDragging: () => undefined },
    },
    {
      provide: OntologyEditService,
      useValue: {
        currentOntologyClasses$,
        isTransacting$: isTransacting$.asObservable(),
        assignPropertyToClass$: () => of(undefined),
      },
    },
    { provide: NotificationService, useValue: { openSnackBar: () => undefined } },
    { provide: LiveAnnouncer, useValue: { announce: () => undefined } },
  ];
};

const meta: Meta<OntologyClassWorkspaceComponent> = {
  title: 'Pages / Ontology Editor / Class Workspace',
  component: OntologyClassWorkspaceComponent,
  decorators: [
    // Replace the heavy real ResourceClassInfo (pulls in MatDialog, KnoraApi,
    // ProjectPageService, etc.) with a shallow mock so stories stay lightweight.
    moduleMetadata({
      imports: [MockComponent(ResourceClassInfoComponent)],
    }),
    applicationConfig({
      providers: [importProvidersFrom(NoopAnimationsModule, TranslateModule.forRoot())],
    }),
  ],
  argTypes: {},
};
export default meta;
type Story = StoryObj<OntologyClassWorkspaceComponent>;

export const EmptyOntologyState: Story = {
  name: 'Shows empty-ontology message when no classes exist',
  decorators: [
    applicationConfig({
      providers: makeProviders([], new Set()),
    }),
  ],
};

export const SelectedClassCards: Story = {
  name: 'Renders one card per class in selection intersection',
  decorators: [
    applicationConfig({
      providers: makeProviders(
        [makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book'), makeClass('iri:C', 'Catalog')],
        new Set(['iri:A', 'iri:C'])
      ),
    }),
  ],
};
