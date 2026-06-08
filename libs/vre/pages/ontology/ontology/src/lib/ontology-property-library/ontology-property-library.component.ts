import { CdkDropList } from '@angular/cdk/drag-drop';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import {
  DefaultProperties,
  DefaultProperty,
  LocalizationService,
  PropertyCategory,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import {
  EditPropertyFormDialogComponent,
} from '../forms/property-form/edit-property-form-dialog.component';
import { CreatePropertyDialogData } from '../forms/property-form/property-form.type';
import { PROPERTY_LIBRARY_DROP_LIST_ID } from '../ontology-editor-shell/property-library-drop-list';
import type { PropertyInfo } from '../ontology.types';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';
import { PropertyRowComponent } from './property-row.component';

/**
 * Right pane of the ontology editor shell.
 *
 * Lists the project's properties with a debounced text filter, an
 * "Unused only" toggle (driven by `PropertyInfo.usedByClasses.length`),
 * and a multi-select category chip-listbox sourced from the static
 * `DefaultProperties.data` catalog.
 *
 * Drag scaffolding:
 * - The container is a `cdkDropList` with the static
 *   `PROPERTY_LIBRARY_DROP_LIST_ID` so workspace cards can declare
 *   `cdkDropListConnectedTo` symbolically.
 * - Each row signals drag start / end via `<app-property-row>` outputs;
 *   the library flips `OntologyEditorViewService.isPropertyDragging$` so
 *   the shell can disable the `<as-split>` gutters mid-drag.
 *
 * Assignment to a class happens exclusively by dropping the row onto a
 * class card in the center pane — see `ResourceClassInfoComponent` for
 * the drop handler.
 */
@Component({
  selector: 'app-ontology-property-library',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    CdkDropList,
    MatChipListbox,
    MatChipOption,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPrefix,
    MatSlideToggle,
    MatSuffix,
    MatTooltip,
    PropertyRowComponent,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './ontology-property-library.component.html',
  styleUrls: ['./ontology-property-library.component.scss'],
})
export class OntologyPropertyLibraryComponent {
  readonly dropListId = PROPERTY_LIBRARY_DROP_LIST_ID;

  /** All available property category labels (Text, Number, Link / Relation, ...). */
  readonly categories = DefaultProperties.data.map(c => c.group);

  /** Full category catalogue used by the Add-property nested menu. */
  readonly propertyCategories: PropertyCategory[] = DefaultProperties.data;

  readonly filterControl = new FormControl<string>('', { nonNullable: true });
  readonly unusedOnlyControl = new FormControl<boolean>(false, { nonNullable: true });
  readonly activeCategories$ = new BehaviorSubject<Set<string>>(new Set());

  private readonly _view = inject(OntologyEditorViewService);
  private readonly _ontologyEdit = inject(OntologyEditService);
  private readonly _localization = inject(LocalizationService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _dialog = inject(MatDialog);
  private readonly _viewContainerRef = inject(ViewContainerRef);

  readonly isEditingEnabled$ = this._view.isEditingEnabled$;

  /**
   * Filtered + categorized property list. Recomputes on locale change so
   * label-based filtering matches what the user sees.
   */
  readonly visibleProperties$ = this._localization.currentLanguage$.pipe(
    switchMap(() =>
      combineLatest([
        this._ontologyEdit.currentProjectsProperties$,
        this.filterControl.valueChanges.pipe(
          startWith(this.filterControl.value),
          debounceTime(150),
          distinctUntilChanged()
        ),
        this.unusedOnlyControl.valueChanges.pipe(startWith(this.unusedOnlyControl.value), distinctUntilChanged()),
        this.activeCategories$,
      ]).pipe(map(([props, query, unusedOnly, categories]) => this._applyFilter(props, query, unusedOnly, categories)))
    )
  );

  constructor() {
    // Mirror "unused only" to the shared view state so other panes can
    // react in the future without re-implementing the same control.
    this.unusedOnlyControl.valueChanges
      .pipe(startWith(this.unusedOnlyControl.value), takeUntilDestroyed(this._destroyRef))
      .subscribe(value => this._view.setUnusedPropertiesOnly(value));

    this.filterControl.valueChanges
      .pipe(startWith(this.filterControl.value), takeUntilDestroyed(this._destroyRef))
      .subscribe(value => this._view.setPropertyFilter(value ?? ''));

    this.activeCategories$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(set => this._view.setPropertyCategoryFilters(set));
  }

  clearFilter(): void {
    this.filterControl.setValue('');
  }

  /**
   * Open the create-property dialog for a chosen `DefaultProperty`. The
   * library entry-point is class-agnostic — the property is created on
   * the current ontology without assignment to a class. Class assignment
   * happens later via drag-and-drop onto a class card.
   */
  openCreateProperty(propType: DefaultProperty): void {
    this._dialog.open<EditPropertyFormDialogComponent, CreatePropertyDialogData>(EditPropertyFormDialogComponent, {
      data: { propType },
      viewContainerRef: this._viewContainerRef,
    });
  }

  /**
   * Toggle handler bound to each `<mat-chip-option>` (selectionChange).
   * Selection is stored locally as a `Set<string>` so the chip listbox's
   * multi-select model stays straightforward.
   */
  toggleCategory(group: string, selected: boolean): void {
    const next = new Set(this.activeCategories$.value);
    if (selected) {
      next.add(group);
    } else {
      next.delete(group);
    }
    this.activeCategories$.next(next);
  }

  /** True if the chip is currently in the active set — used for `[selected]` binding. */
  isCategoryActive(group: string): boolean {
    return this.activeCategories$.value.has(group);
  }

  onPropertyDragStarted(): void {
    this._view.setPropertyDragging(true);
  }

  onPropertyDragEnded(): void {
    this._view.setPropertyDragging(false);
  }

  trackByPropertyId(_: number, prop: PropertyInfo): string {
    return prop.propDef.id;
  }

  // ───── private ───────────────────────────────────────────────────────

  private _applyFilter(
    props: PropertyInfo[],
    rawQuery: string | null,
    unusedOnly: boolean,
    categories: Set<string>
  ): PropertyInfo[] {
    const query = (rawQuery ?? '').trim().toLowerCase();
    return props.filter(p => {
      if (unusedOnly && p.usedByClasses.length > 0) return false;
      if (categories.size > 0 && !categories.has(p.propType?.group ?? '')) return false;
      if (!query) return true;
      const label = this._resolveLabel(p) || p.propDef.id;
      return label.toLowerCase().includes(query);
    });
  }

  private _resolveLabel(prop: PropertyInfo): string {
    const labels = prop.propDef.labels;
    const fallback = prop.propDef.label || '';
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
