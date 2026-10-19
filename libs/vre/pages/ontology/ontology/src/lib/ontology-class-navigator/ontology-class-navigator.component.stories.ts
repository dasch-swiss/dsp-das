import { importProvidersFrom } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateModule } from '@ngx-translate/core';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { BehaviorSubject } from 'rxjs';
import type { ResourceClassInfo } from '../ontology.types';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';
import { OntologyClassNavigatorComponent } from './ontology-class-navigator.component';

/**
 * Build a minimal `ResourceClassInfo`-shaped stub. The navigator only reads
 * `.id`, `.label`, `.labels`, and `.properties[*].propDef.{id,label,labels}`.
 */
const makeClass = (id: string, label: string, properties: { id: string; label: string }[] = []): ResourceClassInfo =>
  ({
    id,
    label,
    labels: [],
    properties: properties.map(p => ({
      propDef: { id: p.id, label: p.label, labels: [] },
    })),
  }) as unknown as ResourceClassInfo;

const makeProviders = (classes: ResourceClassInfo[], selected: Set<string> = new Set()) => {
  const currentOntologyClasses$ = new BehaviorSubject<ResourceClassInfo[]>(classes);
  const selectedClassIris$ = new BehaviorSubject<Set<string>>(selected);
  const isEditingEnabled$ = new BehaviorSubject<boolean>(true);

  const viewService = {
    selectedClassIris$,
    isEditingEnabled$,
    toggleClassSelection: (iri: string) => {
      const next = new Set(selectedClassIris$.value);
      if (next.has(iri)) {
        next.delete(iri);
      } else {
        next.add(iri);
      }
      selectedClassIris$.next(next);
    },
    selectClassIris: (iris: string[]) => {
      const next = new Set(selectedClassIris$.value);
      iris.forEach(i => next.add(i));
      selectedClassIris$.next(next);
    },
    deselectClassIris: (iris: string[]) => {
      const next = new Set(selectedClassIris$.value);
      iris.forEach(i => next.delete(i));
      selectedClassIris$.next(next);
    },
    setClassFilter: () => undefined,
  };

  return [
    { provide: OntologyEditorViewService, useValue: viewService },
    { provide: OntologyEditService, useValue: { currentOntologyClasses$ } },
    {
      provide: LocalizationService,
      useValue: {
        currentLanguage$: new BehaviorSubject('en'),
        currentLanguage: 'en',
      },
    },
  ];
};

const meta: Meta<OntologyClassNavigatorComponent> = {
  title: 'Pages / Ontology Editor / Class Navigator',
  component: OntologyClassNavigatorComponent,
  decorators: [
    applicationConfig({
      providers: [importProvidersFrom(NoopAnimationsModule, TranslateModule.forRoot())],
    }),
  ],
  argTypes: {},
};
export default meta;
type Story = StoryObj<OntologyClassNavigatorComponent>;

export const EmptyOntology: Story = {
  name: 'Shows empty state when no classes exist',
  decorators: [
    applicationConfig({
      providers: makeProviders([]),
    }),
  ],
};

export const PopulatedWithClasses: Story = {
  name: 'Renders flat class list with selectable rows',
  decorators: [
    applicationConfig({
      providers: makeProviders([
        makeClass('iri:A', 'Archive', [
          { id: 'prop:x', label: 'hasArchive' },
          { id: 'prop:y', label: 'hasOther' },
        ]),
        makeClass('iri:B', 'Book'),
      ]),
    }),
  ],
};
