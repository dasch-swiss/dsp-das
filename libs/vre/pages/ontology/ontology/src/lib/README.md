# Ontology Editor

Three-pane editor for browsing and modifying ontology classes and properties.
Delivered as part of the **Ontology Editor Redesign** (Linear DEV-6216).

## Component graph

```
OntologyEditorShellComponent             ← route entry, owns view state
├── OntologyClassNavigatorComponent      ← left pane: MatTree of classes + properties
├── OntologyClassWorkspaceComponent      ← centre pane: ResourceClassInfo cards
│   └── ResourceClassInfoComponent       ← existing card component (drag scaffolding removed)
└── OntologyPropertyLibraryComponent     ← right pane: filtered property list
    └── PropertyRowComponent             ← single row with drag handle + assign menu
```

The shell hosts an `<as-split>` splitter so users can resize the three panes;
gutters are disabled mid-drag via `OntologyEditorViewService.isPropertyDragging$`
to prevent the splitter from intercepting drag-and-drop events.

## State ownership

- **`OntologyEditorViewService`** (page-scoped, provided in the shell's
  `providers: []`) — selection, filters, drag state, keyboard assign target,
  and the `isEditingEnabled$` permission gate. Reconciles selection on
  ontology switch / class removal.
- **`OntologyEditService`** (existing, project-scoped) — domain operations:
  current ontology, project classes/properties, `assignPropertyToClass$`,
  cardinality writes. Untouched by the redesign.

## Drag-and-drop wiring

The property library is a single `cdkDropList` keyed by the static constant
`PROPERTY_LIBRARY_DROP_LIST_ID`. Each workspace card declares
`cdkDropListConnectedTo` with that ID so the connection survives Angular's
DOM diffing.

Drops are disabled when:

- `OntologyEditService.isTransacting$` is `true` (another write is in flight), or
- `OntologyEditorViewService.isEditingEnabled$` is `false` (user lacks
  project-admin rights).

The `onDrop` handler defensively double-checks the permission flag so the
contract is explicit at the call site, not only enforced by the directive.

## Accessibility

- Drop hovers and outcomes are announced via `LiveAnnouncer`:
  - `polite` for drag-over (de-duped by class IRI),
  - `assertive` for assigned / duplicate / failed outcomes.
- Drag handles, assign menu triggers, and filter clear buttons carry
  translatable `aria-label` and `matTooltip`.
- The workspace host receives `aria-busy="true"` while a transaction is in
  flight so screen readers know the UI is mid-update.
- "Assign to class…" matMenu on each property row provides the
  keyboard-only path to the same `assignPropertyToClass$` call the drop
  handler uses.

## Performance budgets

| Scenario                             | Budget                            | Source                                                        |
| ------------------------------------ | --------------------------------- | ------------------------------------------------------------- |
| Filter typing on a 50-class ontology | < 16 ms per keystroke (one frame) | `debounceTime(150)` + `distinctUntilChanged`                  |
| Workspace first paint on selection   | < ~1 s on M1 + 4× CPU throttle    | OnPush + `combineLatest` short-pipe                           |
| Property library first paint         | < ~1 s same conditions            | filter recomputes on locale + filter + category change only   |
| Splitter resize                      | 60 fps                            | `<as-split [disabled]>` flips mid-drag to avoid layout thrash |

These budgets are derived from the PRD's "Quality Gates" section and the
plan's risk matrix entry on MatTree auto-expand. Verification is done in
Chrome devtools on a synthesized 50-class ontology against the local dev
server (`npm run start-local`).

## Routes

The three-pane editor is reachable at:

```
/project/<uuid>/ontology/<name>/editor
```

Legacy `/editor/classes` and `/editor/properties` redirect to `/editor`
(consolidated in Phase 1 of the redesign).

## Testing

```
nx run vre-pages-ontology-ontology:test
nx run vre-pages-ontology-ontology:lint
```

Smoke-level Storybook stories live alongside each new component:

```
nx run dsp-app:storybook         # workspace-level
```

Stories at `Pages / Ontology Editor / *` cover empty and populated states
per component.
