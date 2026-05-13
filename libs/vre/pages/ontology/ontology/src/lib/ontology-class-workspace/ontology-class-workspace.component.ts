import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkDragDrop, CdkDragEnter, CdkDropList } from '@angular/cdk/drag-drop';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { PROPERTY_LIBRARY_DROP_LIST_ID } from '../ontology-editor-shell/property-library-drop-list';
import type { PropertyInfo } from '../ontology.types';
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
 * Empty / loading states:
 * - `currentOntologyClasses$` empty AND not transacting → empty-ontology copy.
 * - `currentOntologyClasses$` populated AND no selection → no-selection copy.
 * - `isTransacting$` true → marks the host `aria-busy` for screen readers.
 *
 * Drag-to-assign:
 * - Each card is its own `cdkDropList` connected to the property library
 *   (`PROPERTY_LIBRARY_DROP_LIST_ID`).
 * - LiveAnnouncer narrates drag start ('polite'), drag enter ('polite',
 *   de-duped against the last-announced class), and drop outcomes ('assertive').
 * - Drops are disabled while `isTransacting$` is true so concurrent ontology
 *   edits don't race the cardinality write.
 */
@Component({
  selector: 'app-ontology-class-workspace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, CdkDropList, ResourceClassInfoComponent, TranslatePipe],
  templateUrl: './ontology-class-workspace.component.html',
  styleUrls: ['./ontology-class-workspace.component.scss'],
})
export class OntologyClassWorkspaceComponent {
  private readonly _view = inject(OntologyEditorViewService);
  private readonly _ontologyEdit = inject(OntologyEditService);
  private readonly _announcer = inject(LiveAnnouncer);
  private readonly _translate = inject(TranslateService);
  private readonly _notification = inject(NotificationService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly isTransacting$ = this._ontologyEdit.isTransacting$;

  /** Static drop-list ID exposed for the template's `cdkDropListConnectedTo`. */
  readonly propertyLibraryDropListId = PROPERTY_LIBRARY_DROP_LIST_ID;

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

  /**
   * Last class IRI the screen reader announced as a drop target. Used to
   * suppress repeated "Over <class>" announcements while a drag hovers
   * inside the same card.
   */
  private readonly _lastAnnouncedTargetIri$ = new BehaviorSubject<string | null>(null);

  /**
   * trackBy for the card @for — keeps Angular's diff stable when classes
   * are re-emitted with the same identity (e.g. property edits upstream).
   */
  trackByClassIri(_: number, klass: { id: string }): string {
    return klass.id;
  }

  /**
   * Announce hovering over a class card. De-duped by class IRI so a drag
   * that wiggles inside the same card doesn't flood the screen reader.
   */
  onDragEntered(_event: CdkDragEnter, classIri: string, classLabel: string): void {
    if (this._lastAnnouncedTargetIri$.value === classIri) return;
    this._lastAnnouncedTargetIri$.next(classIri);
    this._announcer.announce(this._translate.instant('pages.ontology.editor.a11y.dragOver', { classLabel }), 'polite');
  }

  /**
   * Handle the drop. Guards against:
   * - Drops back into the source (shouldn't happen since we don't accept
   *   reorder, but defensive).
   * - Properties already assigned to the target class (duplicate guard with
   *   an assertive announcement so the user knows the drop was rejected).
   *
   * On success / failure the appropriate announcement is made and the
   * shared drag flag is cleared so the splitter re-enables.
   */
  onDrop(event: CdkDragDrop<ResourceClassDefinitionWithAllLanguages, unknown, PropertyInfo>): void {
    if (event.previousContainer === event.container) return;

    const cls = event.container.data;
    const prop = event.item.data;
    const classLabel = cls.label ?? cls.id;
    const propertyLabel = prop.propDef.label ?? prop.propDef.id;

    if (this._isAlreadyAssigned(cls, prop)) {
      this._announcer.announce(
        this._translate.instant('pages.ontology.editor.a11y.assignDuplicate', { propertyLabel, classLabel }),
        'assertive'
      );
      this._notification.openSnackBar(
        this._translate.instant('pages.ontology.editor.notify.alreadyAssigned', { propertyLabel, classLabel })
      );
      return;
    }

    this._ontologyEdit
      .assignPropertyToClass$(prop.propDef.id, cls)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._announcer.announce(
            this._translate.instant('pages.ontology.editor.a11y.assigned', { propertyLabel, classLabel }),
            'assertive'
          );
          this._notification.openSnackBar(
            this._translate.instant('pages.ontology.editor.notify.assigned', { propertyLabel, classLabel })
          );
        },
        error: () => {
          this._announcer.announce(
            this._translate.instant('pages.ontology.editor.a11y.assignFailed', { propertyLabel, classLabel }),
            'assertive'
          );
          this._notification.openSnackBar(
            this._translate.instant('pages.ontology.editor.notify.assignFailed', { propertyLabel, classLabel }),
            'error'
          );
        },
      });
  }

  /**
   * Duplicate-guard helper. Reads `propertiesList` (canonical iHasProperty
   * array) and checks for an existing entry pointing at the property.
   */
  private _isAlreadyAssigned(cls: ResourceClassDefinitionWithAllLanguages, prop: PropertyInfo): boolean {
    return (cls.propertiesList ?? []).some(p => p.propertyIndex === prop.propDef.id);
  }
}
