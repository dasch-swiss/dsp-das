import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import type { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import type { ResourceClassInfo } from '../ontology.types';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';

export interface PropertyTreeNode {
  iri: string;
  label: string;
}

export interface ClassTreeNode {
  iri: string;
  label: string;
  properties: PropertyTreeNode[];
}

type TreeNode = ClassTreeNode | PropertyTreeNode;

/**
 * Left pane of the ontology editor shell.
 *
 * Renders a filterable, expandable tree of classes and their properties using
 * the Material 18+ `MatTree` direct API (not `MatTreeControl`). Multi-select
 * class checkboxes drive `OntologyEditorViewService.selectedClassIris$`; the
 * filter matches either a class label or any of its property labels in the
 * user's active locale.
 *
 * When the filter is non-empty every visible class branch is auto-expanded so
 * matched properties are immediately discoverable. Expand/collapse state is
 * kept on the component (not the shared view service) so opening branches
 * doesn't pollute the centrally-shared selection / filter state.
 */
@Component({
  selector: 'app-ontology-class-navigator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    MatButton,
    MatCheckbox,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatPrefix,
    MatSuffix,
    MatTooltip,
    MatTreeModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './ontology-class-navigator.component.html',
  styleUrls: ['./ontology-class-navigator.component.scss'],
})
export class OntologyClassNavigatorComponent implements OnInit {
  @ViewChild(MatTree) treeRef?: MatTree<TreeNode>;

  private readonly _view = inject(OntologyEditorViewService);
  private readonly _ontologyEdit = inject(OntologyEditService);
  private readonly _localization = inject(LocalizationService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly filterControl = new FormControl<string>('', { nonNullable: true });

  readonly selectedIris$ = this._view.selectedClassIris$;
  readonly isEditingEnabled$ = this._view.isEditingEnabled$;

  /**
   * Children accessor for the MatTree. Property nodes have no children;
   * class nodes return their property list.
   */
  readonly childrenAccessor = (node: TreeNode): TreeNode[] => ('properties' in node ? node.properties : []);

  /**
   * Tracks the latest tree snapshot so template helpers (select-all, count)
   * can operate without re-deriving from the observable.
   */
  private readonly _latestTree$ = new BehaviorSubject<ClassTreeNode[]>([]);
  readonly latestTree$ = this._latestTree$.asObservable();

  /**
   * Filtered tree derived from currentOntologyClasses$, the filter text, and
   * the active language (so locale changes re-emit and matching uses the
   * user-visible label).
   */
  readonly filteredTree$ = this._localization.currentLanguage$.pipe(
    switchMap(() =>
      combineLatest([
        this._ontologyEdit.currentOntologyClasses$,
        this.filterControl.valueChanges.pipe(
          startWith(this.filterControl.value),
          debounceTime(150),
          distinctUntilChanged()
        ),
      ]).pipe(map(([classes, query]) => this._applyFilter(classes, (query ?? '').trim().toLowerCase())))
    )
  );

  ngOnInit(): void {
    // Push every emission to the latest-tree BehaviorSubject so template
    // helpers (select-all, deselect-all, header count) can resolve
    // synchronously. Keeps the filter pipeline as the single source of
    // truth for visibility.
    this.filteredTree$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(tree => {
      this._latestTree$.next(tree);

      // Mirror the active filter text into the shared view state so other
      // panes can react if they ever want to (no current consumer, but the
      // service exposes the field).
      this._view.setClassFilter(this.filterControl.value ?? '');

      // Auto-expand every visible branch on non-empty filter. The
      // queueMicrotask wrapper lets MatTree render the new dataSource
      // before we ask it to expand nodes (avoids tree.expand() on a node
      // the renderer hasn't seen yet).
      const query = (this.filterControl.value ?? '').trim();
      if (!query) return;
      queueMicrotask(() => {
        for (const node of tree) {
          this.treeRef?.expand(node);
        }
      });
    });
  }

  // ───── selection helpers ─────────────────────────────────────────────

  isSelected(iri: string, selected: Set<string>): boolean {
    return selected.has(iri);
  }

  toggleClass(iri: string): void {
    this._view.toggleClassSelection(iri);
  }

  selectAllVisible(): void {
    const tree = this._latestTree$.value;
    this._view.selectClassIris(tree.map(n => n.iri));
  }

  deselectAllVisible(): void {
    const tree = this._latestTree$.value;
    this._view.deselectClassIris(tree.map(n => n.iri));
  }

  clearFilter(): void {
    this.filterControl.setValue('');
  }

  // ───── tree helpers ──────────────────────────────────────────────────

  trackNode(_: number, node: TreeNode): string {
    return node.iri;
  }

  isClassNode(_: number, node: TreeNode): node is ClassTreeNode {
    return 'properties' in node;
  }

  // ───── private ───────────────────────────────────────────────────────

  private _applyFilter(classes: ResourceClassInfo[], query: string): ClassTreeNode[] {
    if (!query) {
      return classes.map(c => this._toNode(c));
    }

    return classes
      .map(c => {
        const classLabel = this._resolveLabel(c.labels, c.label);
        const classMatches = classLabel.toLowerCase().includes(query);

        const matchedProps = (c.properties ?? []).filter(p => {
          const propLabel = this._resolveLabel(p.propDef.labels, p.propDef.label || '');
          return propLabel.toLowerCase().includes(query);
        });

        if (classMatches) {
          // Class label matches — keep the full property list under it.
          return this._toNode(c);
        }
        if (matchedProps.length > 0) {
          // Show class with only the matched properties so users see why
          // it surfaced.
          return this._toNode(c, matchedProps);
        }
        return null;
      })
      .filter((n): n is ClassTreeNode => n !== null);
  }

  private _toNode(c: ResourceClassInfo, props: ResourceClassInfo['properties'] = c.properties ?? []): ClassTreeNode {
    return {
      iri: c.id,
      label: this._resolveLabel(c.labels, c.label),
      properties: (props ?? []).map(p => ({
        iri: p.propDef.id,
        label: this._resolveLabel(p.propDef.labels, p.propDef.label || ''),
      })),
    };
  }

  private _resolveLabel(labels: StringLiteralV2[] | undefined, fallback: string): string {
    if (!labels || labels.length === 0) return fallback;
    const lang = this._localization.getCurrentLanguage();
    return (
      labels.find(l => l.language === lang)?.value ??
      labels.find(l => !l.language)?.value ??
      labels[0]?.value ??
      fallback
    );
  }
}
