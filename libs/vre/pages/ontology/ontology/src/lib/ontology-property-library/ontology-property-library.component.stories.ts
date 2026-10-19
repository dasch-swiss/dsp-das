import { importProvidersFrom } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateModule } from '@ngx-translate/core';
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { MockComponent } from 'ng-mocks';
import { BehaviorSubject, of } from 'rxjs';
import type { PropertyInfo, ResourceClassInfo } from '../ontology.types';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';
import { OntologyPropertyLibraryComponent } from './ontology-property-library.component';
import { PropertyRowComponent } from './property-row.component';

const makeProperty = (
  id: string,
  label: string,
  options: { usedByClasses?: { id: string }[]; group?: string } = {}
): PropertyInfo =>
  ({
    propDef: { id, label, labels: [] },
    propType: { icon: 'short_text', group: options.group ?? 'Text' },
    usedByClasses: options.usedByClasses ?? [],
  }) as unknown as PropertyInfo;

const makeClass = (id: string, label: string): ResourceClassInfo =>
  ({
    id,
    label,
    labels: [],
    resourceClassDefinition: { id, propertiesList: [] },
  }) as unknown as ResourceClassInfo;

const makeProviders = (properties: PropertyInfo[], classes: ResourceClassInfo[] = []) => {
  const currentProjectsProperties$ = new BehaviorSubject<PropertyInfo[]>(properties);
  const currentOntologyClasses$ = new BehaviorSubject<ResourceClassInfo[]>(classes);
  const isEditingEnabled$ = new BehaviorSubject<boolean>(true);

  return [
    {
      provide: OntologyEditorViewService,
      useValue: {
        isEditingEnabled$,
        setDraggedProperty: () => undefined,
        setUnusedPropertiesOnly: () => undefined,
        setPropertyFilter: () => undefined,
        setPropertyCategoryFilters: () => undefined,
      },
    },
    {
      provide: OntologyEditService,
      useValue: {
        currentProjectsProperties$,
        currentOntologyClasses$,
        assignPropertyToClass$: () => of(undefined),
      },
    },
    {
      provide: LocalizationService,
      useValue: {
        currentLanguage$: new BehaviorSubject('en'),
        currentLanguage: 'en',
      },
    },
    { provide: NotificationService, useValue: { openSnackBar: () => undefined } },
  ];
};

const meta: Meta<OntologyPropertyLibraryComponent> = {
  title: 'Pages / Ontology Editor / Property Library',
  component: OntologyPropertyLibraryComponent,
  decorators: [
    // Replace `<app-property-row>` with a mock — the row pulls in MatMenu and
    // cdkDrag plumbing that requires a real ontology edit context to render.
    moduleMetadata({
      imports: [MockComponent(PropertyRowComponent)],
    }),
    applicationConfig({
      providers: [importProvidersFrom(NoopAnimationsModule, TranslateModule.forRoot())],
    }),
  ],
  argTypes: {},
};
export default meta;
type Story = StoryObj<OntologyPropertyLibraryComponent>;

export const EmptyPropertyList: Story = {
  name: 'Shows filter controls with no properties to display',
  decorators: [
    applicationConfig({
      providers: makeProviders([], []),
    }),
  ],
};

export const PopulatedWithProperties: Story = {
  name: 'Renders property rows with filter and category controls',
  decorators: [
    applicationConfig({
      providers: makeProviders(
        [
          makeProperty('prop:1', 'hasTitle', { group: 'Text' }),
          makeProperty('prop:2', 'hasCount', { group: 'Number' }),
          makeProperty('prop:3', 'hasRelation', { group: 'Link', usedByClasses: [{ id: 'iri:A' }] }),
        ],
        [makeClass('iri:A', 'Archive'), makeClass('iri:B', 'Book')]
      ),
    }),
  ],
};
