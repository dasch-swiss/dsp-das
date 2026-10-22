import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import type { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { BehaviorSubject } from 'rxjs';
import type { ResourceClassInfo } from '../ontology.types';
import { ResourceClassInfoComponent } from '../resource-classes/resource-class-info/resource-class-info.component';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';
import { OntologyClassWorkspaceComponent } from './ontology-class-workspace.component';

/**
 * Minimal `ResourceClassInfo`-shaped stub — the workspace only reads `.id`
 * (and forwards the whole object to `<app-resource-class-info>`, which is
 * mocked away here).
 */
const makeClass = (id: string, label = id): ResourceClassInfo =>
  ({
    id,
    label,
    resourceClassDefinition: { id, label, propertiesList: [] } as unknown as ResourceClassDefinitionWithAllLanguages,
  }) as unknown as ResourceClassInfo;

describe('OntologyClassWorkspaceComponent', () => {
  let fixture: ComponentFixture<OntologyClassWorkspaceComponent>;
  let currentOntologyClasses$: BehaviorSubject<ResourceClassInfo[]>;
  let selectedClassIris$: BehaviorSubject<Set<string>>;
  let isTransacting$: BehaviorSubject<boolean>;

  const setup = () => {
    currentOntologyClasses$ = new BehaviorSubject<ResourceClassInfo[]>([]);
    selectedClassIris$ = new BehaviorSubject<Set<string>>(new Set());
    isTransacting$ = new BehaviorSubject<boolean>(false);

    TestBed.configureTestingModule({
      imports: [OntologyClassWorkspaceComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: OntologyEditorViewService, useValue: { selectedClassIris$ } },
        {
          provide: OntologyEditService,
          useValue: {
            currentOntologyClasses$,
            isTransacting$: isTransacting$.asObservable(),
          },
        },
      ],
    })
      // ResourceClassInfo pulls in MatDialog, KnoraApiConnection, ProjectPageService,
      // etc. The workspace's job is just to render one card per visible class —
      // replacing the real component with a shallow mock keeps the spec focused.
      .overrideComponent(OntologyClassWorkspaceComponent, {
        remove: { imports: [ResourceClassInfoComponent] },
        add: { imports: [MockComponent(ResourceClassInfoComponent)] },
      });

    fixture = TestBed.createComponent(OntologyClassWorkspaceComponent);
    fixture.detectChanges();
  };

  describe('rendering', () => {
    it('renders one card per class in the selected ∩ current intersection', () => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A'), makeClass('iri:B'), makeClass('iri:C')]);
      selectedClassIris$.next(new Set(['iri:A', 'iri:C']));
      fixture.detectChanges();

      const cards = fixture.nativeElement.querySelectorAll('.workspace__card');
      expect(cards.length).toBe(2);
      expect(cards[0].getAttribute('data-iri')).toBe('iri:A');
      expect(cards[1].getAttribute('data-iri')).toBe('iri:C');
    });

    it('orders cards by the upstream class list (not selection insertion order)', () => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A'), makeClass('iri:B'), makeClass('iri:C')]);
      // Selection added in reverse order — grid order must still follow upstream order.
      selectedClassIris$.next(new Set(['iri:C', 'iri:A']));
      fixture.detectChanges();

      const cards: Element[] = Array.from(fixture.nativeElement.querySelectorAll('.workspace__card'));
      expect(cards.map(c => c.getAttribute('data-iri'))).toEqual(['iri:A', 'iri:C']);
    });

    it('drops selected IRIs that are no longer present in currentOntologyClasses$', () => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A'), makeClass('iri:B')]);
      selectedClassIris$.next(new Set(['iri:A', 'iri:B']));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.workspace__card').length).toBe(2);

      currentOntologyClasses$.next([makeClass('iri:A')]);
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('.workspace__card');
      expect(cards.length).toBe(1);
      expect(cards[0].getAttribute('data-iri')).toBe('iri:A');
    });
  });

  describe('empty states', () => {
    it('shows the empty-ontology message when no classes exist', () => {
      setup();
      currentOntologyClasses$.next([]);
      selectedClassIris$.next(new Set());
      fixture.detectChanges();

      const empty = fixture.nativeElement.querySelector('[data-cy="class-workspace-empty"]');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('pages.ontology.editor.emptyOntology');
    });

    it('shows the no-selection message when classes exist but none are selected', () => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A'), makeClass('iri:B')]);
      selectedClassIris$.next(new Set());
      fixture.detectChanges();

      const empty = fixture.nativeElement.querySelector('[data-cy="class-workspace-empty"]');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('pages.ontology.editor.noSelection');
    });

    it('does not render the grid when the visible-classes set is empty', () => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A')]);
      selectedClassIris$.next(new Set());
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-cy="class-workspace-grid"]')).toBeNull();
    });
  });

  describe('loading state', () => {
    it('marks the host with aria-busy=true while a transaction is in flight', () => {
      setup();
      isTransacting$.next(true);
      fixture.detectChanges();

      const root = fixture.nativeElement.querySelector('.workspace') as HTMLElement;
      expect(root.getAttribute('aria-busy')).toBe('true');
    });

    it('omits aria-busy when no transaction is in flight', () => {
      setup();
      isTransacting$.next(false);
      fixture.detectChanges();

      const root = fixture.nativeElement.querySelector('.workspace') as HTMLElement;
      expect(root.getAttribute('aria-busy')).toBeNull();
    });
  });

  describe('trackByClassIri', () => {
    it('returns the IRI as the track-by key', () => {
      setup();
      expect(fixture.componentInstance.trackByClassIri(0, { id: 'iri:Z' })).toBe('iri:Z');
    });
  });
});
