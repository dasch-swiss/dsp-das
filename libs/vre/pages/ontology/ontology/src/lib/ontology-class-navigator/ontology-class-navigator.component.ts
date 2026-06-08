import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import type { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { DefaultClass, DefaultResourceClasses, LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import { CreateResourceClassDialogComponent } from '../forms/resource-class-form/create-resource-class-dialog.component';
import type { ResourceClassInfo } from '../ontology.types';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';

export interface MatchedProperty {
  iri: string;
  label: string;
}

export interface ClassListNode {
  iri: string;
  label: string;
  /**
   * Properties that matched the active filter via their own label.
   * Empty when no filter is active OR when the class itself matched the
   * filter (in which case the property surface adds nothing). Used to
   * tell the user *why* a class is in the visible list.
   */
  matchedProperties: MatchedProperty[];
}

/**
 * Left pane of the ontology editor shell.
 *
 * Renders a filterable flat list of classes with multi-select checkboxes
 * that drive `OntologyEditorViewService.selectedClassIris$`. The filter
 * matches either a class label or any of its property labels in the
 * user's active locale.
 *
 * When the filter matches a class via one of its assigned properties (not
 * via the class label itself), the matched property labels are listed
 * directly beneath the class row so the user understands why it surfaced.
 *
 * The header also exposes a "Create new class" icon button — wired up
 * via a sibling task, this component just exposes the affordance.
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
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPrefix,
    MatSuffix,
    MatTooltip,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './ontology-class-navigator.component.html',
  styleUrls: ['./ontology-class-navigator.component.scss'],
})
export class OntologyClassNavigatorComponent implements OnInit {
  private readonly _view = inject(OntologyEditorViewService);
  private readonly _ontologyEdit = inject(OntologyEditService);
  private readonly _localization = inject(LocalizationService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _dialog = inject(MatDialog);
  private readonly _viewContainerRef = inject(ViewContainerRef);

  readonly filterControl = new FormControl<string>('', { nonNullable: true });

  readonly selectedIris$ = this._view.selectedClassIris$;
  readonly isEditingEnabled$ = this._view.isEditingEnabled$;

  /** Default class catalogue used by the Create-class nested menu. */
  readonly defaultClasses: DefaultClass[] = DefaultResourceClasses.data;

  /**
   * Tracks the latest list snapshot so template helpers (select-all, count)
   * can operate without re-deriving from the observable.
   */
  private readonly _latestList$ = new BehaviorSubject<ClassListNode[]>([]);
  readonly latestList$ = this._latestList$.asObservable();

  /**
   * Filtered list derived from currentOntologyClasses$, the filter text,
   * and the active language (so locale changes re-emit and matching uses
   * the user-visible label).
   */
  readonly filteredList$ = this._localization.currentLanguage$.pipe(
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
    this.filteredList$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(list => {
      this._latestList$.next(list);
      this._view.setClassFilter(this.filterControl.value ?? '');
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
    const list = this._latestList$.value;
    this._view.selectClassIris(list.map(n => n.iri));
  }

  deselectAllVisible(): void {
    const list = this._latestList$.value;
    this._view.deselectClassIris(list.map(n => n.iri));
  }

  clearFilter(): void {
    this.filterControl.setValue('');
  }

  /**
   * Open the create-resource-class dialog for a chosen `DefaultClass`.
   * Mirrors the pattern the old `OntologySidenavComponent` used so the
   * existing dialog wiring (and its post-create reload) keeps working.
   */
  openCreateClass(defaultClass: DefaultClass): void {
    this._dialog.open<CreateResourceClassDialogComponent, DefaultClass>(CreateResourceClassDialogComponent, {
      ...DspDialogConfig.mediumDialog(defaultClass),
      viewContainerRef: this._viewContainerRef,
    });
  }

  // ───── list helpers ──────────────────────────────────────────────────

  trackNode(_: number, node: ClassListNode): string {
    return node.iri;
  }

  trackProp(_: number, prop: MatchedProperty): string {
    return prop.iri;
  }

  // ───── private ───────────────────────────────────────────────────────

  private _applyFilter(classes: ResourceClassInfo[], query: string): ClassListNode[] {
    if (!query) {
      return classes.map(c => ({
        iri: c.id,
        label: this._resolveLabel(c.labels, c.label),
        matchedProperties: [],
      }));
    }

    return classes
      .map(c => {
        const classLabel = this._resolveLabel(c.labels, c.label);
        const classMatches = classLabel.toLowerCase().includes(query);

        const matchedProps = (c.properties ?? [])
          .filter(p => {
            const propLabel = this._resolveLabel(p.propDef.labels, p.propDef.label || '');
            return propLabel.toLowerCase().includes(query);
          })
          .map(p => ({
            iri: p.propDef.id,
            label: this._resolveLabel(p.propDef.labels, p.propDef.label || ''),
          }));

        if (classMatches) {
          return { iri: c.id, label: classLabel, matchedProperties: [] };
        }
        if (matchedProps.length > 0) {
          return { iri: c.id, label: classLabel, matchedProperties: matchedProps };
        }
        return null;
      })
      .filter((n): n is ClassListNode => n !== null);
  }

  private _resolveLabel(labels: StringLiteralV2[] | undefined, fallback: string): string {
    if (!labels || labels.length === 0) return fallback;
    const lang = this._localization.getCurrentLanguage();
    return (
      labels.find(l => 'language' in l && l.language === lang)?.value ??
      labels.find(l => !('language' in l) || !l.language)?.value ??
      labels[0]?.value ??
      fallback
    );
  }
}
