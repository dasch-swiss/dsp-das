# DSP-DAS — Learnings

Accumulated debugging insights, architectural gotchas, and patterns discovered while working on [DSP-DAS](https://github.com/dasch-swiss/dsp-das).

---

## Boolean `false` Fails Truthiness Validation (DEV-5866)

**Context:** The save button in the property editor was disabled when the boolean value was `false`.

**Root cause:** The validity check used JavaScript truthiness:

```typescript
// BUG: !!false === false, so this treats false as "no value"
!!this.group.controls.item.value
```

**Fix:** Use explicit null-checking instead:

```typescript
// CORRECT: false is a valid value, only null means "no value"
this.group.controls.item.value !== null
```

**Rule of thumb:** Never use `!!value` or truthiness checks to validate form controls that can legitimately hold falsy values (`false`, `0`, `""`). Always use explicit null/undefined checks.

**Affected file:** `property-value-edit.component.ts` (line 134)

---

## RxJS `valueChanges` Doesn't Emit Initial State (DEV-5866)

**Context:** After fixing the truthiness bug above, the save button was *still* disabled when first adding a new boolean value. The user had to toggle the value before the button would enable.

**Root cause:** `hasValidValue$` was built from `this.group.valueChanges`, which only emits on *changes* — not the initial value. When adding a new boolean (initial value `false`), no change event fires, so the observable never evaluates.

```typescript
// BUG: no emission until user interacts with the form
this.hasValidValue$ = this.group.valueChanges.pipe(
  switchMap(() => of(this.group.controls.item.valid && this.group.controls.item.value !== null))
);
```

**Fix:** Add `startWith(null)` to trigger an immediate evaluation:

```typescript
// CORRECT: evaluates initial form state immediately
this.hasValidValue$ = this.group.valueChanges.pipe(
  startWith(null),
  switchMap(() => of(this.group.controls.item.valid && this.group.controls.item.value !== null))
);
```

**Existing pattern in codebase:**

- `property-value-creator.component.ts:91` — uses `startWith(this.formGroup.controls.item.getRawValue())`
- `_watchAndSetupCommentStatus()` in the same file — uses `startWith(null)` on `statusChanges`
- `iiif-control.component.ts`, `interval-value.component.ts`, `list-value.component.ts` — all use `startWith`

**Rule of thumb:** When deriving state from `valueChanges` or `statusChanges`, always ask: "Does the initial state need to be evaluated?" If yes, add `startWith(null)` (or `startWith(initialValue)`). The `switchMap` reads from the form controls directly, so the emitted value doesn't matter — it just needs a "kick" to trigger the first evaluation.

---

## Reuse Existing CDK Drag-and-Drop Patterns (DEV-5870)

**Context:** Needed to add drag-and-drop reordering for values within a property.

**Decision:** Used Angular CDK `cdkDropList` + `cdkDrag` + `cdkDragHandle` with `drag_indicator` icon, matching existing patterns already in the codebase:

- `resource-class-info.component.ts` — ontology property reorder
- Search order-by components

**Rule of thumb:** Before implementing drag-and-drop, search the codebase for existing CDK drag-drop patterns. Consistency reduces review friction and ensures tested behavior. The `cdkDragHandle` pattern (drag only via a handle icon, not the whole row) is the established convention in this codebase.

**Affected file:** `property-values.component.ts`

---

## Use Lightweight Custom Drag Previews for Complex Components (DEV-5870)

**Context:** The default CDK drag preview cloned the entire value component DOM, causing jank during drag.

**Root cause:** Value components contain complex sub-components (CKEditor instances, file previews, IIIF viewers). CDK's default preview clones the full DOM subtree, which is expensive for these heavy components.

**Fix:** Use `*cdkDragPreview` with a lightweight summary element instead of the default full-clone:

```html
<!-- Lightweight preview instead of cloning the full value component -->
<div *cdkDragPreview class="drag-preview">
  {{ getValueSummary(value) }}
</div>
```

**Rule of thumb:** When dragging components with heavy DOM subtrees, always provide a custom `*cdkDragPreview`. The default clone can cause jank, layout issues, and even break components that assume a single instance (like CKEditor).

**Affected file:** `property-values.component.ts`

---

## Direct `HttpClient` Calls When `dsp-js` Lacks the Endpoint (DEV-5870)

**Context:** The new `PUT /v2/values/order` endpoint wasn't available in `@dasch-swiss/dsp-js` yet, but the frontend needed to call it.

**Decision:** Used direct `HttpClient.put()` with `DspApiConfigToken` / `KnoraApiConfig` to build the base URL:

```typescript
@Injectable({ providedIn: 'root' })
export class ValueOrderService {
  constructor(
    private readonly http: HttpClient,
    @Inject(DspApiConfigToken) private readonly config: KnoraApiConfig,
  ) {}

  reorderValues(resourceIri: string, propertyIri: string, orderedValueIris: string[]): Observable<any> {
    const url = `${this.config.apiProtocol}://${this.config.apiHost}:${this.config.apiPort}/v2/values/order`;
    return this.http.put(url, { resourceIri, propertyIri, orderedValueIris });
  }
}
```

**Rule of thumb:** When `dsp-js` doesn't expose a new API endpoint yet, use direct `HttpClient` calls with `DspApiConfigToken` for the base URL. Add a `// TODO: migrate to dsp-js when available` comment. This avoids blocking frontend work on library releases.
