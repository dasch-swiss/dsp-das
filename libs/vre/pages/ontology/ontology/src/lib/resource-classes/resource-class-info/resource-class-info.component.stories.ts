import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { BehaviorSubject, of } from 'rxjs';
import { expect, userEvent, within } from 'storybook/test';
import { OntologyPropertyLibraryComponent } from '../../ontology-property-library/ontology-property-library.component';
import { ClassPropertyInfo, PropertyInfo, ResourceClassInfo } from '../../ontology.types';
import { OntologyEditService } from '../../services/ontology-edit.service';
import { OntologyEditorViewService } from '../../services/ontology-editor-view.service';
import {
  makeClassPropertyInfo,
  makeOntologyEditServiceStub,
  makeResourceClassDefinition,
  makeOntologyEditorViewServiceStub,
  makeProjectPageServiceStub,
  makeResourceClassInfo,
  STORY_PROVIDERS,
} from '../../stories.helpers';
import { ResourceClassInfoComponent } from './resource-class-info.component';

const resourceClass = makeResourceClassInfo();

const meta: Meta<ResourceClassInfoComponent> = {
  title: 'Ontology Editor / 3a. Resource Classes Tab / Resource Class Info',
  component: ResourceClassInfoComponent,
  argTypes: {
    resourceClass: {
      description: 'The resource class model to display including its properties.',
      table: { type: { summary: 'ResourceClassInfo' }, category: 'Inputs' },
    },
  },
};
export default meta;
type Story = StoryObj<ResourceClassInfoComponent>;

const sharedProviders = [
  provideAnimations(),
  importProvidersFrom(OverlayModule),
  ...STORY_PROVIDERS,
  { provide: DspApiConnectionToken, useValue: { v2: { onto: { canDeleteResourceClass: () => of({ canDo: true }) } } } },
  { provide: OntologyEditService, useValue: makeOntologyEditServiceStub() },
  { provide: OntologyEditorViewService, useValue: makeOntologyEditorViewServiceStub() },
  { provide: ProjectPageService, useValue: makeProjectPageServiceStub() },
  { provide: NotificationService, useValue: { openSnackBar: () => {} } },
  { provide: Clipboard, useValue: { copy: () => {} } },
  { provide: DialogService, useValue: { afterConfirmation: () => of(true) } },
];

export const EmptyClass: Story = {
  name: 'Renders resource class card with no properties',
  decorators: [applicationConfig({ providers: sharedProviders })],
  args: { resourceClass },
  play: async ({ canvasElement, step }) => {
    await step('Class card is rendered', async () => {
      await expect(canvasElement).toBeInTheDocument();
    });
  },
};

export const AdminView: Story = {
  name: 'Shows edit controls for admin users',
  decorators: [applicationConfig({ providers: sharedProviders })],
  args: { resourceClass },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Edit menu button is visible on hover', async () => {
      const card = canvas.getByTestId('class-card');
      await userEvent.hover(card);
      await expect(canvas.getByTestId('more-button')).toBeInTheDocument();
    });
  },
};

export const ReadOnlyView: Story = {
  name: 'Hides edit controls for non-admin users',
  decorators: [
    applicationConfig({
      providers: [
        ...sharedProviders,
        { provide: ProjectPageService, useValue: makeProjectPageServiceStub({ hasProjectAdminRights$: of(false) }) },
      ],
    }),
  ],
  args: { resourceClass },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Edit menu button is not present', async () => {
      await expect(canvas.queryByTestId('class-menu-button')).toBeNull();
    });
  },
};

const restrictedProperty = {
  propDef: { id: 'http://0.0.0.0:3333/ontology/0001/other/v2#hasTitle', label: 'Title' },
} as unknown as PropertyInfo;

export const FlagsRestrictedDraggedProperty: Story = {
  name: 'Flags itself while a property restricted to another class is dragged',
  decorators: [
    applicationConfig({
      providers: [
        ...sharedProviders,
        {
          provide: OntologyEditService,
          useValue: makeOntologyEditServiceStub({ canAssignPropertyToClass: () => false }),
        },
        {
          provide: OntologyEditorViewService,
          useValue: makeOntologyEditorViewServiceStub({ draggedProperty$: new BehaviorSubject(restrictedProperty) }),
        },
      ],
    }),
  ],
  args: { resourceClass },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The card shows the restriction hint', async () => {
      await expect(canvas.getByTestId('class-card-drop-blocked')).toBeInTheDocument();
      await expect(canvas.getByTestId('class-card')).toHaveAttribute('aria-disabled', 'true');
    });
  },
};

const ONTO = 'http://0.0.0.0:3333/ontology/0001/test/v2';

const classProperty = (name: string, guiOrder: number): ClassPropertyInfo => {
  const base = makeClassPropertyInfo();
  const id = `${ONTO}#${name}`;
  return {
    ...base,
    propDef: { ...base.propDef, id, label: name, labels: [{ language: 'en', value: name }] } as typeof base.propDef,
    iHasProperty: { ...base.iHasProperty, propertyIndex: id, guiOrder },
  };
};

const libraryProperty = (name: string): PropertyInfo => {
  const { iHasProperty: _iHasProperty, classId: _classId, ...property } = classProperty(name, 0);
  return property;
};

const cardProperties = [classProperty('hasTitle', 1), classProperty('hasAuthor', 2), classProperty('hasDate', 3)];
const cardDefinition = makeResourceClassDefinition();
cardDefinition.propertiesList = cardProperties.map(p => p.iHasProperty);
const classWithProperties = new ResourceClassInfo(cardDefinition, cardProperties);

const libraryProperties = [libraryProperty('hasSubtitle'), libraryProperty('hasRestrictedNote')];
const draggedProperty$ = new BehaviorSubject<PropertyInfo | null>(null);

export const DragFromLibrary: Story = {
  name: 'Accepts library properties next to its property list',
  decorators: [
    moduleMetadata({ imports: [CdkDropListGroup, OntologyPropertyLibraryComponent] }),
    applicationConfig({
      providers: [
        ...sharedProviders,
        {
          provide: OntologyEditService,
          useValue: makeOntologyEditServiceStub({
            currentProjectsProperties$: of(libraryProperties),
            canAssignPropertyToClass: (property: PropertyInfo) => !property.propDef.id.endsWith('#hasRestrictedNote'),
          }),
        },
        {
          provide: OntologyEditorViewService,
          useValue: makeOntologyEditorViewServiceStub({
            draggedProperty$,
            setDraggedProperty: (property: PropertyInfo | null) => draggedProperty$.next(property),
            setUnusedPropertiesOnly: () => undefined,
            setPropertyFilter: () => undefined,
            setPropertyCategoryFilters: () => undefined,
          }),
        },
        {
          provide: LocalizationService,
          useValue: { currentLanguage$: new BehaviorSubject('en'), currentLanguage: 'en' },
        },
      ],
    }),
  ],
  args: { resourceClass: classWithProperties },
  render: args => ({
    props: args,
    template: `
      <div cdkDropListGroup style="display: flex; gap: 24px; align-items: flex-start">
        <div style="width: 480px"><app-resource-class-info [resourceClass]="resourceClass" /></div>
        <div style="width: 360px; height: 480px"><app-ontology-property-library /></div>
      </div>`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The card lists its properties and the library offers draggable rows', async () => {
      await expect(canvas.getAllByTestId('property-label')).toHaveLength(3);
      // The library renders its rows after the filter's debounce.
      await expect(await canvas.findAllByTestId('property-row')).toHaveLength(2);
    });
  },
};
