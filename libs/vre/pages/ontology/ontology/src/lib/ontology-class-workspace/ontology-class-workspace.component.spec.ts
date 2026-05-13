import { LiveAnnouncer } from '@angular/cdk/a11y';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import type { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { BehaviorSubject, of, throwError } from 'rxjs';
import type { PropertyInfo, ResourceClassInfo } from '../ontology.types';
import { ResourceClassInfoComponent } from '../resource-classes/resource-class-info/resource-class-info.component';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';
import { OntologyClassWorkspaceComponent } from './ontology-class-workspace.component';

/**
 * Minimal `ResourceClassInfo`-shaped stub — the workspace only reads `.id`
 * (and forwards the `resourceClassDefinition` to drop-list data + the whole
 * object to `<app-resource-class-info>` which is mocked).
 */
const makeClass = (id: string, label = id, propertiesList: { propertyIndex: string }[] = []): ResourceClassInfo =>
  ({
    id,
    label,
    resourceClassDefinition: { id, label, propertiesList } as unknown as ResourceClassDefinitionWithAllLanguages,
  }) as unknown as ResourceClassInfo;

/** Build a `CdkDragDrop`-shaped event with just the fields `onDrop` reads. */
const makeDrop = (
  cls: ResourceClassDefinitionWithAllLanguages,
  prop: PropertyInfo,
  samePrevious = false
): CdkDragDrop<ResourceClassDefinitionWithAllLanguages, unknown, PropertyInfo> =>
  ({
    previousContainer: samePrevious ? { data: cls } : { data: 'library' },
    container: { data: cls },
    item: { data: prop },
  }) as unknown as CdkDragDrop<ResourceClassDefinitionWithAllLanguages, unknown, PropertyInfo>;

const makeProp = (id: string, label = id): PropertyInfo => ({ propDef: { id, label } }) as unknown as PropertyInfo;

describe('OntologyClassWorkspaceComponent', () => {
  let fixture: ComponentFixture<OntologyClassWorkspaceComponent>;
  let component: OntologyClassWorkspaceComponent;
  let currentOntologyClasses$: BehaviorSubject<ResourceClassInfo[]>;
  let selectedClassIris$: BehaviorSubject<Set<string>>;
  let isTransacting$: BehaviorSubject<boolean>;
  let isEditingEnabled$: BehaviorSubject<boolean>;
  let assignPropertyToClass$: jasmine.Spy | jest.Mock;
  let setPropertyDragging: jest.Mock;
  let openSnackBar: jest.Mock;
  let announce: jest.Mock;

  const setup = () => {
    currentOntologyClasses$ = new BehaviorSubject<ResourceClassInfo[]>([]);
    selectedClassIris$ = new BehaviorSubject<Set<string>>(new Set());
    isTransacting$ = new BehaviorSubject<boolean>(false);
    isEditingEnabled$ = new BehaviorSubject<boolean>(true);
    assignPropertyToClass$ = jest.fn(() => of(undefined));
    setPropertyDragging = jest.fn();
    openSnackBar = jest.fn();
    announce = jest.fn();

    TestBed.configureTestingModule({
      imports: [OntologyClassWorkspaceComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        {
          provide: OntologyEditorViewService,
          useValue: { selectedClassIris$, setPropertyDragging, isEditingEnabled$ },
        },
        {
          provide: OntologyEditService,
          useValue: {
            currentOntologyClasses$,
            isTransacting$: isTransacting$.asObservable(),
            assignPropertyToClass$,
          },
        },
        { provide: NotificationService, useValue: { openSnackBar } },
        { provide: LiveAnnouncer, useValue: { announce } },
      ],
    })
      // ResourceClassInfo pulls in MatDialog, KnoraApiConnection, ProjectPageService,
      // etc. The workspace's job is just to render one card per visible class —
      // replacing the heavy real component with a shallow mock keeps the spec
      // focused on the workspace's own logic (filtering + empty states + drops).
      .overrideComponent(OntologyClassWorkspaceComponent, {
        remove: { imports: [ResourceClassInfoComponent] },
        add: { imports: [MockComponent(ResourceClassInfoComponent)] },
      });

    fixture = TestBed.createComponent(OntologyClassWorkspaceComponent);
    component = fixture.componentInstance;
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

      const cards = fixture.nativeElement.querySelectorAll('.workspace__card');
      expect(Array.from(cards).map((c: Element) => c.getAttribute('data-iri'))).toEqual(['iri:A', 'iri:C']);
    });

    it('drops selected IRIs that are no longer present in currentOntologyClasses$', () => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A'), makeClass('iri:B')]);
      selectedClassIris$.next(new Set(['iri:A', 'iri:B']));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.workspace__card').length).toBe(2);

      // Reconciliation upstream would normally trim the selection, but the
      // workspace itself defends against stale IRIs by intersecting.
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

  describe('drop targets', () => {
    it('renders one cdkDropList per card connected to the property library drop-list id', () => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A'), makeClass('iri:B')]);
      selectedClassIris$.next(new Set(['iri:A', 'iri:B']));
      fixture.detectChanges();

      const cards = fixture.nativeElement.querySelectorAll('.workspace__card');
      expect(cards.length).toBe(2);
      // Per-card drop list scaffolding — CdkDropList stamps the directive
      // as an attribute on the element.
      cards.forEach((card: Element) => {
        expect(card.hasAttribute('cdkDropList') || card.hasAttribute('ng-reflect-cdk-drop-list-data')).toBe(true);
      });
    });
  });

  describe('onDragEntered', () => {
    it('announces the first enter and de-dupes repeats on the same class', () => {
      setup();
      const fakeEvent = {} as never;
      component.onDragEntered(fakeEvent, 'iri:A', 'Class A');
      component.onDragEntered(fakeEvent, 'iri:A', 'Class A');

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce.mock.calls[0][0]).toContain('pages.ontology.editor.a11y.dragOver');
    });

    it('announces again after the drag moves to a different class', () => {
      setup();
      const fakeEvent = {} as never;
      component.onDragEntered(fakeEvent, 'iri:A', 'Class A');
      component.onDragEntered(fakeEvent, 'iri:B', 'Class B');

      expect(announce).toHaveBeenCalledTimes(2);
    });
  });

  describe('onDrop', () => {
    it('ignores drops where previousContainer === container (defensive)', () => {
      setup();
      const cls = makeClass('iri:A').resourceClassDefinition;
      const prop = makeProp('prop:1');
      const event = {
        previousContainer: { data: cls },
        container: { data: cls },
        item: { data: prop },
      } as unknown as CdkDragDrop<ResourceClassDefinitionWithAllLanguages, unknown, PropertyInfo>;
      // Force the strict reference equality used by `===`.
      (event as { previousContainer: unknown }).previousContainer = event.container;

      component.onDrop(event);
      expect(assignPropertyToClass$).not.toHaveBeenCalled();
    });

    it('rejects duplicates with an assertive announce + snackbar', () => {
      setup();
      const cls = makeClass('iri:A', 'Class A', [{ propertyIndex: 'prop:1' }]).resourceClassDefinition;
      const prop = makeProp('prop:1', 'Prop One');
      const event = makeDrop(cls, prop);

      component.onDrop(event);

      expect(assignPropertyToClass$).not.toHaveBeenCalled();
      expect(announce).toHaveBeenCalledWith(expect.stringContaining('assignDuplicate'), 'assertive');
      expect(openSnackBar).toHaveBeenCalledWith(expect.stringContaining('alreadyAssigned'));
    });

    it('calls assignPropertyToClass$ and announces success on a clean drop', () => {
      setup();
      const cls = makeClass('iri:A', 'Class A').resourceClassDefinition;
      const prop = makeProp('prop:1', 'Prop One');
      const event = makeDrop(cls, prop);

      component.onDrop(event);

      expect(assignPropertyToClass$).toHaveBeenCalledWith('prop:1', cls);
      expect(announce).toHaveBeenCalledWith(expect.stringContaining('a11y.assigned'), 'assertive');
      expect(openSnackBar).toHaveBeenCalledWith(expect.stringContaining('notify.assigned'));
    });

    it('announces failure assertively + error snackbar when the API rejects', () => {
      setup();
      (assignPropertyToClass$ as jest.Mock).mockReturnValueOnce(throwError(() => new Error('boom')));

      const cls = makeClass('iri:A', 'Class A').resourceClassDefinition;
      const prop = makeProp('prop:1', 'Prop One');
      const event = makeDrop(cls, prop);

      component.onDrop(event);

      expect(announce).toHaveBeenCalledWith(expect.stringContaining('assignFailed'), 'assertive');
      expect(openSnackBar).toHaveBeenCalledWith(expect.stringContaining('notify.assignFailed'), 'error');
    });
  });

  describe('isTransacting$ disables drop', () => {
    it('flips cdkDropListDisabled to true when a transaction is in flight', () => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A')]);
      selectedClassIris$.next(new Set(['iri:A']));
      isTransacting$.next(true);
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.workspace__card') as HTMLElement;
      // CdkDropList stamps the disabled state via the `cdk-drop-list-disabled`
      // class on the host element.
      expect(card.classList.contains('cdk-drop-list-disabled')).toBe(true);
    });

    it('keeps cdkDropListDisabled false while idle', () => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A')]);
      selectedClassIris$.next(new Set(['iri:A']));
      isTransacting$.next(false);
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.workspace__card') as HTMLElement;
      expect(card.classList.contains('cdk-drop-list-disabled')).toBe(false);
    });
  });

  describe('trackByClassIri', () => {
    it('returns the IRI as the track-by key', () => {
      setup();
      expect(component.trackByClassIri(0, { id: 'iri:Z' })).toBe('iri:Z');
    });
  });

  describe('permission gating', () => {
    it('disables the drop list when isEditingEnabled$ is false', () => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A')]);
      selectedClassIris$.next(new Set(['iri:A']));
      isEditingEnabled$.next(false);
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.workspace__card') as HTMLElement;
      // CdkDropList stamps the disabled state via the `cdk-drop-list-disabled`
      // class on the host element.
      expect(card.classList.contains('cdk-drop-list-disabled')).toBe(true);
    });

    it('short-circuits onDrop when editing is disabled', () => {
      setup();
      isEditingEnabled$.next(false);

      const cls = makeClass('iri:A', 'Class A').resourceClassDefinition;
      const prop = makeProp('prop:1', 'Prop One');
      const event = makeDrop(cls, prop);

      component.onDrop(event);

      expect(assignPropertyToClass$).not.toHaveBeenCalled();
    });

    it('re-enables drop when editing returns to true and no transaction is in flight', () => {
      setup();
      currentOntologyClasses$.next([makeClass('iri:A')]);
      selectedClassIris$.next(new Set(['iri:A']));
      isEditingEnabled$.next(false);
      fixture.detectChanges();
      isEditingEnabled$.next(true);
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.workspace__card') as HTMLElement;
      expect(card.classList.contains('cdk-drop-list-disabled')).toBe(false);
    });
  });
});
