import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { combineLatest, map } from 'rxjs';
import { ResourceClassInfoComponent } from '../resource-classes/resource-class-info/resource-class-info.component';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';

/**
 * Center pane of the ontology editor shell.
 *
 * Renders a responsive grid of `<app-resource-class-info>` cards for the
 * intersection of `selectedClassIris$` and `currentOntologyClasses$`. The grid
 * uses CSS `repeat(auto-fill, minmax(420px, 1fr))` so cards reflow naturally
 * when the as-split splitter is resized.
 *
 * Drag-to-assign is owned by the card itself (see `ResourceClassInfoComponent`):
 * the card's inner property `cdkDropList` is connected to the property library
 * so library drops produce a position placeholder alongside existing rows and
 * are accepted/rejected via `cdkDropListEnterPredicate`.
 *
 * Empty / loading states:
 * - `currentOntologyClasses$` empty AND not transacting → empty-ontology copy.
 * - `currentOntologyClasses$` populated AND no selection → no-selection copy.
 * - `isTransacting$` true → marks the host `aria-busy` for screen readers.
 */
@Component({
  selector: 'app-ontology-class-workspace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, ResourceClassInfoComponent, TranslatePipe],
  templateUrl: './ontology-class-workspace.component.html',
  styleUrls: ['./ontology-class-workspace.component.scss'],
})
export class OntologyClassWorkspaceComponent {
  private readonly _view = inject(OntologyEditorViewService);
  private readonly _ontologyEdit = inject(OntologyEditService);

  readonly isTransacting$ = this._ontologyEdit.isTransacting$;

  /**
   * Cards visible in the workspace: classes that exist in the current
   * ontology AND have been selected in the navigator pane.
   *
   * Order follows `currentOntologyClasses$` (sorted by label upstream),
   * not the selection-set insertion order, so the grid stays stable across
   * toggles.
   */
  readonly visibleClasses$ = combineLatest([
    this._ontologyEdit.currentOntologyClasses$,
    this._view.selectedClassIris$,
  ]).pipe(map(([classes, selected]) => classes.filter(c => selected.has(c.id))));

  /**
   * True when the ontology has classes but none are selected — drives the
   * "Select classes in the navigator…" prompt without needing to read the
   * latest values manually in the template.
   */
  readonly hasUnselectedClasses$ = combineLatest([
    this._ontologyEdit.currentOntologyClasses$,
    this._view.selectedClassIris$,
  ]).pipe(map(([classes, selected]) => classes.length > 0 && selected.size === 0));

  trackByClassIri(_: number, klass: { id: string }): string {
    return klass.id;
  }
}
