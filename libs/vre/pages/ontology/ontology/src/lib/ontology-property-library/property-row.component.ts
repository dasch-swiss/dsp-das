import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import type { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslatePipe } from '@ngx-translate/core';
import type { ResourceClassInfo, PropertyInfo } from '../ontology.types';

export interface AssignTarget {
  iri: string;
  label: string;
}

/**
 * Single row in the property library list.
 *
 * Renders the property's icon (from its `propType.icon`), localized label,
 * type group chip, a drag handle (`cdkDragHandle`), and an
 * "Assign to class…" menu listing every class the property is *not* yet
 * assigned to.
 *
 * Drag start / end signalling is the parent's responsibility — the row
 * forwards `cdkDragStarted` / `cdkDragEnded` via two outputs so the parent
 * can flip `OntologyEditorViewService.isPropertyDragging$`. The row itself
 * stays template-only.
 *
 * Edit affordances (drag handle, assign menu) are hidden when
 * `editingEnabled` is `false`.
 */
@Component({
  selector: 'app-property-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDrag,
    CdkDragHandle,
    MatButton,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    TranslatePipe,
  ],
  templateUrl: './property-row.component.html',
  styleUrls: ['./property-row.component.scss'],
})
export class PropertyRowComponent {
  @Input({ required: true }) property!: PropertyInfo;
  /** Classes in the current ontology — used to populate the assign menu (filtered to non-assigned). */
  @Input({ required: true }) assignableClasses: ResourceClassInfo[] = [];
  @Input() editingEnabled = true;

  @Output() readonly dragStarted = new EventEmitter<void>();
  @Output() readonly dragEnded = new EventEmitter<void>();
  @Output() readonly assignToClass = new EventEmitter<AssignTarget>();

  private readonly _localization = inject(LocalizationService);

  get label(): string {
    return this._resolveLabel(this.property.propDef.labels, this.property.propDef.label || this.property.propDef.id);
  }

  get icon(): string {
    return this.property.propType?.icon || 'data_object';
  }

  get group(): string {
    return this.property.propType?.group || '';
  }

  /**
   * Classes from `assignableClasses` that the property is not yet assigned
   * to. The `usedByClasses` set on a PropertyInfo is the authoritative
   * "already used" signal — derived upstream from the cardinality lists.
   */
  get unassignedClasses(): { iri: string; label: string }[] {
    const used = new Set(this.property.usedByClasses.map(c => c.id));
    return this.assignableClasses
      .filter(c => !used.has(c.id))
      .map(c => ({ iri: c.id, label: this._resolveLabel(c.labels, c.label) }));
  }

  onAssign(target: { iri: string; label: string }): void {
    this.assignToClass.emit(target);
  }

  onDragStarted(): void {
    this.dragStarted.emit();
  }

  onDragEnded(): void {
    this.dragEnded.emit();
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
